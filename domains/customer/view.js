import CustomerRepository from '../../models/customer.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const resp = await checkFindOne(CustomerRepository, filter, options)
  return resp
}
