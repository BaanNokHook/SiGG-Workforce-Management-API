// @flow
import taskRepository from '../../models/task.repository'
import taskCompletedEvent from './events/taskCompletedEvent'
import { checkUpdate, checkFindOne } from '../../utils/domain'
import { TaskUpdatedEvent } from './events/taskUpdatedEvent'

export default async (filter: any, data: any) => {
  await checkFindOne(taskRepository, filter)
  const respTaskUpdate = await checkUpdate(taskRepository, filter, data)
  await Promise.all([
    taskCompletedEvent(respTaskUpdate),
    new TaskUpdatedEvent().execute(respTaskUpdate),
  ])
  return respTaskUpdate
}
