import todoFlowRepository from '../../models/todoFlow.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const response = await checkDelete(todoFlowRepository, filter)
  return response
}
