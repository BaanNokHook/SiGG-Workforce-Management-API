import R from 'ramda'
import TaskRepository from '../../models/task.repository'
import TripRepository from '../../models/trip.repository'
import { checkFind } from '../../utils/domain'


/**
 *  Create Trip
 * TODO: Trip can create trip by without staffs , tasks
 */

export default async data => {
  const { tasks = [] } = data
  const tasksOrEmpty = await checkFind(TaskRepository, { _id: { $in: tasks } })

  /** Validate tasks, In case tasks from request body not found */
  if (tasksOrEmpty.length === 0 || tasks.length !== tasksOrEmpty.length) {
    let taskIds = []
    if (R.type(tasks[0]) === 'Object') {
      taskIds = tasks.map(task => task._id)
    }
    throw new Error(`Not Found TaskId ${taskIds.toString()}`)
  }

  /** Validate tasks, If tasks have tripId system will cannot create trip  */
  const validTasksFromDB = tasksOrEmpty.some(task => task.tripId)
  if (validTasksFromDB) throw new Error(`This some task still process working`)

  const trip = await TripRepository.create({ ...data })
  await TaskRepository.model.updateMany({ _id: { $in: data.tasks } }, { tripId: trip._id })
  return trip
}
