import TaskTypeRepository from '../../models/taskType.repository'
import { isRequiredField, alreadyExistThrowError } from '../../utils/domain'
import checkMapping from './checkMapping'

const validate = {
  code: true,
  name: true,
  skills: true,
  taskTypeGroup: true,
  projectId: true,
  companyId: true,
}
const checkDuplicateTaskTypeCodeAndName = async (data = {}) => {
  const { code, name, projectId, companyId } = data
  await alreadyExistThrowError(TaskTypeRepository, {
    projectId,
    companyId,
    $or: [{ code }, { name }],
  })
}
export default async (data = {}) => {
  const { mapping, projectId, companyId } = data
  isRequiredField(data, validate)
  await checkDuplicateTaskTypeCodeAndName(data)
  if (mapping) {
    await checkMapping(mapping, projectId, companyId)
  }
  const { projectId: referenceProjectId, companyId: referenceCompanyId } = data
  const resp = await TaskTypeRepository.create({ ...data, referenceProjectId, referenceCompanyId })
  return resp
}
