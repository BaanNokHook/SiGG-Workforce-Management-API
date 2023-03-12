import TaskTypeRepository from '../../models/taskType.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const response = await checkDelete(TaskTypeRepository, filter)
  return response
}
