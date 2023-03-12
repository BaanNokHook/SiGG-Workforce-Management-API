// @flow
import R from 'ramda'
import { TripStatus } from '../../../constants/trip'
import { conductorClient } from '../../../libraries/conductor'
import TripTransportQueue from '../../../services/rascal/publishers/tripTransport.publisher'
import { checkFindOne } from '../../../utils/domain'
import TripRepository from '../../../models/trip.repository'
import getWorkflowById from '../../conductor/getWorkflowInstantById'
import { getTaskInstantBySubWorkflow } from '../../conductor/getTaskInstantBySubWorkflow'
import { compareTaskStateMaximum } from '../../conductor/compareTaskStateMaximum'
import { findTransportTaskType } from '../../todo/conductorTransportTracking'

const CONDUCTOR_STATUS_COMPLETED = `COMPLETED`

export default async (tripId: string) => {
  const trip = await checkFindOne(
    TripRepository,
    { _id: tripId },
    { populate: [{ path: 'tasks' }] },
  )

  if (trip.status !== TripStatus.DONE) return

  const { companyId, projectId, status, _id, orderId } = trip
  const payload = {
    orderId: trip.orderId,
    trip: {
      companyId,
      projectId,
      status,
      _id,
      orderId,
    },
    tasks: trip.tasks.map((task) => ({ _id: task._id, status: task.status })),
    staffId: R.uniq(trip.staffs),
  }

  await TripTransportQueue(payload)

  const isTrackWorkflowConductorEngine = trip.workflowInstanceId && trip.workflowTaskId
  if (isTrackWorkflowConductorEngine) {
    const workflowInstant = await getWorkflowById(trip.workflowInstanceId)
    const TransportTaskInstant = findTransportTaskType(workflowInstant.data)
    const taskMainOrSubWorkflow = await getTaskInstantBySubWorkflow(TransportTaskInstant)

    const taskInstantFinal = taskMainOrSubWorkflow
      ? compareTaskStateMaximum(taskMainOrSubWorkflow)
      : {}

    const statuses = [
      ...R.pathOr({}, ['statuses'], taskInstantFinal),
      { status: `Trip Completed`, updatedAt: Date.now() },
    ]

    const outputData = {
      ...(taskInstantFinal || {}),
      statuses,
      completeTransport: true,
    }

    await conductorClient.updateTask({
      workflowInstanceId: trip.workflowInstanceId,
      taskId: trip.workflowTaskId,
      status: CONDUCTOR_STATUS_COMPLETED,
      outputData,
    })
  }
}
