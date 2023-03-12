import CustomerRepository from '../../models/customer.repository'
import { checkUpdate, checkFindOne } from '../../utils/domain'

export default async (filter: any, data: any) => {
  await checkFindOne(CustomerRepository, filter)
  const resp = await checkUpdate(CustomerRepository, filter, data)
  return resp
}
