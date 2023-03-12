import extensionFlowRepository from '../../models/extensionFlow.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const resp = await checkFindOne(extensionFlowRepository, filter, options)
  return resp
}
