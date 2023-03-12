import TaskTypeRepository from '../../models/taskType.repository'
import { isRequiredField, checkUpdate, checkFindOne } from '../../utils/domain'
import checkMapping from './checkMapping'

const validate = {
  _id: true,
  projectId: true,
  companyId: true,
}

export default async (filter: any, data = {}) => {
  const { projectId, companyId, _id: taskTypeId } = data
  isRequiredField({ ...data, ...filter }, validate)
  await checkMapping([data], projectId, companyId, taskTypeId)
  await checkFindOne(TaskTypeRepository, filter)
  const resp = await checkUpdate(TaskTypeRepository, filter, { $push: { mapping: data } })
  return resp
}
