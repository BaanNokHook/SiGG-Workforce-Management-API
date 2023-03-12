import R from 'ramda'
import TripRepository from '../models/trip.repository'
import { checkUpdate, findOneWithOutThrow } from './domain'

const TASK_STATUS = { isAccept: 'TODO', isStart: 'DOING', isLast: 'DONE', isPending: 'PENDING' }
const TRIP_STATUS = { isAccept: 'TODO', isStart: 'DOING', isLast: 'DONE', isPending: 'PENDING' }
const populateTaskDoing = {
  populate: {
    path: 'tasks',
    match: { $or: [{ status: TASK_STATUS.isStart }, { status: TASK_STATUS.isPending }] },
  },
}

// eslint-disable-next-line import/prefer-default-export
export const isCompleteAllTask = async filter => {
  const trip = await findOneWithOutThrow(
    TripRepository,
    { ...filter, status: TRIP_STATUS.isStart },
    populateTaskDoing,
  )
  if (R.isEmpty(trip)) {
    await checkUpdate(TripRepository, { _id: filter }, { $set: { status: TRIP_STATUS.isLast } })
  } else {
    await checkUpdate(TripRepository, { _id: filter }, { $set: { status: TRIP_STATUS.isStart } })
  }
  return trip
}
