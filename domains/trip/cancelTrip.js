import R from 'ramda'
import moment from 'moment'
import tripRepository from '../../models/trip.repository'
import TaskUpdateMany from '../task/updateMany'
import Throw from '../../error/basic'
import { checkFindOne, isRequiredField } from '../../utils/domain'
import TripTransportPublish from '../../services/rascal/publishers/tripTransport.publisher'
import conductorCancelWorkflow from '../conductor/cancelWorkflow'
import RejectTrip from '../reject/rejectTrip'
import CancelDriverEvent from './events/cancelDriverEvent'

import logger from '../../libraries/logger'

type CancelTripType = {
  _id: string,
  remark: true,
  requestDate: string,
  referenceId: string,
  referenceType: 'TRIP' | 'TASK',
  projectId: string,
  companyId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  refs: {},
  orderStatus: string,
}

const POPULATE_TRIP = JSON.stringify([
  {
    path: 'tasks',
    select: `extensionFlow _id`,
    populate: { path: 'extensionFlow', select: '_id orderReturn , orderReject' },
  },
])

const STATUS_MAPPING_CANCEL = {
  PASSENGER: { $nin: ['FAILED'] },
  DRIVER: { $nin: ['PENDING', 'FAILED'] },
  COURIER: { $nin: ['FAILED'] },
  ADMIN: { $nin: ['FAILED'] },
}

const MAPPING_ORDER_STATUS_TO_STATUS = {
  ORDER_CANCELLED: 'CANCELLED',
  ORDER_FAILED: 'FAILED',
}

const validate = {
  _id: true,
}

const event = 'CANCEL_TRIP'

export default async (filter: any, data: CancelTripType) => {
  isRequiredField({ ...filter, ...data }, validate)
  const tripId = filter._id
  try {
    const prepareTripFilterUpdate = {
      _id: tripId,
      rejectRequest: { $size: 0 },
      status: STATUS_MAPPING_CANCEL[data.requestRole],
    }

    /** [RaceCondition] in case before update  */
    const prepareTripDataUpdate = {
      $set: {
        status: MAPPING_ORDER_STATUS_TO_STATUS[data.orderStatus],
        completedAt: moment(),
        note: data.note || '',
      },
    }

    const tripUpdated = await tripRepository.model.update(
      prepareTripFilterUpdate,
      prepareTripDataUpdate,
    )

    if (tripUpdated.nModified === 0) {
      throw Throw.CANCEL_TRIP_FAILED({ message: `Cancel trip failed  retry again` })
    }

    const trip = await checkFindOne(tripRepository, { _id: tripId }, { populate: POPULATE_TRIP })

    const { projectId, companyId, referenceProjectId, referenceCompanyId } = trip
    const extensionFlow = R.path(['tasks', '0', 'extensionFlow'], trip)

    const prepareRejectData = {
      remark: data.remark || null,
      requestBy: data.userId || 'external_service', // userId
      requestRole: data.requestRole,
      referenceId: trip._id,
      referenceType: 'TRIP',
      requestDate: moment(),
      projectId,
      companyId,
      referenceProjectId,
      referenceCompanyId,
      extensionFlow,
    }

    const tripRejected = await RejectTrip(prepareRejectData)

    await TaskUpdateMany(
      { tripId: trip._id },
      {
        $set: { status: MAPPING_ORDER_STATUS_TO_STATUS[data.orderStatus], completedAt: moment() },
        $push: { rejectRequest: tripRejected._id },
      },
    )

    if (data.orderStatus) {
      tripRejected.orderStatus = data.orderStatus
    }

    if (trip.workflowInstanceId) {
      await conductorCancelWorkflow({
        workflowInstanceId: trip.workflowInstanceId,
        reason: tripRejected.toObject(),
        orderId: trip.orderId,
        requestRole: data.requestRole,
      })
      await CancelDriverEvent(tripId, tripRejected)
    }

    await TripTransportPublish({
      trip: { _id: trip._id, status: 'REJECT' },
      tasks: trip.tasks.map((task) => ({ _id: task._id, status: 'REJECT' })),
      staffId: data.staffId ? [data.staffId] : [],
    })

    logger.info({ event, tripId })

    return tripRejected
  } catch (error) {
    console.log(error)
    logger.error({ event, err: error, tripId })
    throw Throw.CANCEL_TRIP_FAILED({ message: `Cancel trip ${tripId} failed  retry again` })
  }
}
