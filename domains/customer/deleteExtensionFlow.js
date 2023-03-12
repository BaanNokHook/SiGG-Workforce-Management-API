import extensionFlowRepository from '../../models/extensionFlow.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const response = await checkDelete(extensionFlowRepository, filter)
  return response
}
