import R from 'ramda'
import TaskRepository from '../../models/task.repository'
import TripRepository from '../../models/trip.repository'
import Throw from '../../error/basic'

type Filter = {
  _id: string,
}

type RequestType = {
  tasks: string[],
}

export default async (filter: Filter, data: RequestType) => {
  if (R.type(data.tasks) !== 'Array') {
    throw Throw.ADD_TASK_TO_TRIP_FAILED(`Invalid 'tasks' must be an array`)
  }

  const res = await TripRepository.model.findOneAndUpdate(
    filter,
    {
      $addToSet: { tasks: { $each: data.tasks } },
    },
    { new: true },
  )

  await TaskRepository.model.updateMany({ _id: { $in: data.tasks } }, { tripId: filter._id })

  return res
}
