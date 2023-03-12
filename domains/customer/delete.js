import CustomerRepository from '../../models/customer.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const resp = await checkDelete(CustomerRepository, filter)
  return resp
}
