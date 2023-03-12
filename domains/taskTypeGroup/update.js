import TaskTypeGroupRepository from '../../models/taskTypeGroup.repository'
import { checkUpdate, checkFindOne } from '../../utils/domain'

export default async (filter: any, data: any) => {
  await checkFindOne(TaskTypeGroupRepository, filter)
  const taskTypeGroupUpdate = await checkUpdate(TaskTypeGroupRepository, filter, data)
  return taskTypeGroupUpdate
}
