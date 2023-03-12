import ParcelRepository from '../../models/parcel.repository'
import { findCustomer } from '../../utils/customer.util'
import { consignmentsValidate } from '../../utils/extension.util'

export default async (data: any, customerCode: string) => {
  await consignmentsValidate([data.consignment])
  const custCode = customerCode ? await findCustomer({ code: customerCode }) : null
  // if (!custCode) throw new Error('Invalid Customer Code !')
  const resp = await ParcelRepository.create({
    ...data,
    ...(custCode && { 'referrences.parcel.customer': custCode._id }),
  })
  return resp
}
