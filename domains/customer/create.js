import R from 'ramda'
import CustomerRepository from '../../models/customer.repository'
import { isRequiredField, alreadyExistThrowError } from '../../utils/domain'
import { createTodoType } from '../../utils/extension.util'
import { overrideWorkFlow } from '../../utils/customer.util'

const validate = {
  code: true,
  name: true,
  email: true,
  phone: true,
}

export default async (data: any) => {
  isRequiredField(data, validate)
  await alreadyExistThrowError(CustomerRepository, { code: data.code })
  const resp = await CustomerRepository.create(data)
  return resp
}
