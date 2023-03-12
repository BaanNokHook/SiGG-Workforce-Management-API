// @flow
import R from 'ramda'
import moment from 'moment'
import { checkFindOne, checkUpdate } from '../../utils/domain'
import TripRepository from '../../models/trip.repository'
import tripCompletedEvent from './events/tripCompletedEvent'
import { TripStatus } from '../../constants/trip'
import logger from '../../libraries/logger/index'

const filterTasksRequired = R.pipe(R.pathOr([], ['tasks']), R.filter(R.propEq('isRequired', true)))

const groupTaskByStatus = R.groupBy(R.prop('status'))

const countTaskByStatus = (taskGroupStatusKey: TaskGroupByStatus) => {
  const transformValue = R.pipe(
    R.toPairs,
    R.map(([key, val]) => {
      return [[key], val.length]
    }),
    R.fromPairs,
  )
  return transformValue(taskGroupStatusKey)
}

/** Validate TimeStamp Fields */
const validateTimeStampDuplicate = (trip, metaFields) => {
  let newTimeStamp = metaFields
  if (trip.startedAt) {
    newTimeStamp = R.omit(['startedAt'], metaFields)
  }
  if (trip.acceptedAt) {
    newTimeStamp = R.omit(['acceptedAt'], metaFields)
  }
  return newTimeStamp
}

const groupTaskByStatusTotal = R.pipe(groupTaskByStatus, countTaskByStatus)

export default async (tripId: string, metaFields = {}) => {
  const tripExists = await checkFindOne(
    TripRepository,
    { _id: tripId },
    { populate: { path: 'tasks' } },
  )
  const trip = R.type(tripExists.toObject) === `Function` ? tripExists.toObject() : tripExists
  const tasksRequired = filterTasksRequired(trip)
  const TASK_TOTAL = tasksRequired.length

  const taskGroupByStatus = groupTaskByStatusTotal(tasksRequired)

  let prepareTripData = {}
  const mergeMetadata = R.mergeDeepRight(trip, metaFields)
  if (taskGroupByStatus.DONE === TASK_TOTAL) {
    logger.info({ event: 'TRIP_VALIDATE', message: 'all task', tripId: trip._id })
    prepareTripData = {
      ...mergeMetadata,
      completedAt: moment(),
      status: TripStatus.DONE,
    }
  } else {
    logger.info({ event: 'TRIP_VALIDATE', message: 'some task', tripId: trip._id })
    const metadataWithTimeStampNotDuplicate = validateTimeStampDuplicate(trip, mergeMetadata)
    prepareTripData = {
      ...metadataWithTimeStampNotDuplicate,
      status: TripStatus.DOING,
    }
  }

  const TripUpdated = await checkUpdate(TripRepository, { _id: trip._id }, prepareTripData)
  logger.info({ event: 'TRIP_VALIDATE', tripId: trip._id })
  await tripCompletedEvent(trip._id)
  return TripUpdated
}
