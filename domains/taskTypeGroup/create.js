import TaskTypeGroupRepository from '../../models/taskTypeGroup.repository'
import { isRequiredField } from '../../utils/domain'

const validate = {
  name: true,
  description: true,
  active: true,
}
export default async (data = {}) => {
  isRequiredField(data, validate)
  const resp = await TaskTypeGroupRepository.create(data)
  return resp
}
