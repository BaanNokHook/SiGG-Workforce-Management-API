import TaskRepository from '../../models/task.repository'

export default async (filter, data) => {
  const taskUpdated = await TaskRepository.model.updateMany(filter, data)
  return taskUpdated
}
