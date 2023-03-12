import todoFlowRepository from '../../models/todoFlow.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any = {}, options: any = {}) => {
  isRequiredField(filter, validate)
  const response = await checkFindOne(todoFlowRepository, filter, {
    ...(options.populate && { populate: options.populate }),
  })

  return response
}
