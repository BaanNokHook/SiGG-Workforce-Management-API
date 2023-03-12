import TaskTypeGroupRepository from '../../models/taskTypeGroup.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const response = await checkFindOne(TaskTypeGroupRepository, filter, options)
  return response
}
