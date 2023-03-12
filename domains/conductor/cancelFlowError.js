// @flow
import R from 'ramda'
import moment from 'moment'
import TripTransportPublish from '../../services/rascal/publishers/tripTransport.publisher'
import tripRepository from '../../models/trip.repository'
import logger from '../../libraries/logger'
import getWorkflowById from './getWorkflowInstantById'
import { getTaskLastByWorkflowInstant } from './getTaskLastByWorkflowInstant'
import TaskUpdateMany from '../task/updateMany'
import { getTaskInstantBySubWorkflow } from './getTaskInstantBySubWorkflow'
import { compareTaskStateMaximum } from './compareTaskStateMaximum'
import type { TaskInstant } from './Types'

const POPULATE_DEFAULT = [{ path: 'tasks', populate: [{ path: 'todos' }] }]
const FAILED = `FAILED`
const REJECT = `REJECT`

const event = 'WORKFLOW_CANCEL_TRIP'

export default async (data: TaskInstant) => {
  const { inputData } = data
  const { orders } = inputData

  const workflowInstantFailId = R.pathOr(null, ['inputData', 'orders', 'workflowId'], data)
  const workflowInstant = await getWorkflowById(workflowInstantFailId)
  const TaskInstantLast = getTaskLastByWorkflowInstant(workflowInstant)
  const taskMainOrSubWorkflow = await getTaskInstantBySubWorkflow(TaskInstantLast)

  const taskInstantFinal = taskMainOrSubWorkflow
    ? compareTaskStateMaximum(taskMainOrSubWorkflow)
    : {}

  const staffId = R.pathOr(null, ['staffId'], taskInstantFinal)

  const orderId =
    R.pathOr(null, ['order', 'orderId'], orders) || R.pathOr(null, ['orders', 'orderId'], orders)

  const metadata = R.pickAll(['outputData', 'inputData'], taskMainOrSubWorkflow)

  const isTaskInstantHasOutputDataEmpty = R.propSatisfies(obj => R.isEmpty(obj), 'outputData')

  const getState = isTaskInstantHasOutputDataEmpty(metadata)
    ? metadata.inputData
    : metadata.outputData

  try {
    const trip = await tripRepository.findOne({
      _id: getState.tripId,
    })

    if (trip) {
      const tripUpdated = await tripRepository.model.updateMany(
        { _id: trip._id },
        { status: FAILED, completedAt: moment() },
      )

      const taskUpdated = await TaskUpdateMany(
        { tripId: trip._id },
        {
          $set: { status: FAILED, completedAt: moment() },
        },
      )

      await TripTransportPublish({
        trip: { _id: trip._id, status: REJECT },
        tasks: trip.tasks.map(task => ({ _id: task._id, status: REJECT })),
        staffId: staffId ? [staffId] : [],
      })
    }

    const result = {
      workflowInstantFailId,
      orderId,
      currentOrderStatus: 'ORDER_FAILED',
      staffId,
      ...getState,
      statuses: [
        ...R.pathOr({}, ['statuses'], getState),
        {
          status: `ORDER_REJECT_SUCCESS`,
          updatedAt: Date.now(),
        },
      ],
    }

    logger.info({ event, orderId }, JSON.stringify(result))
    return result
  } catch (error) {
    logger.error({ event, orderId, err: error })
    return {
      workflowInstantFailId,
      orderId,
      ...getState,
      statuses: [
        ...R.pathOr({}, ['statuses'], getState),
        {
          status: `ORDER_REJECT_FAILED`,
          updatedAt: Date.now(),
          error: JSON.stringify(error, null, 2),
        },
      ],
    }
  }
}
