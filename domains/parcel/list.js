import ParcelRepository from '../../models/parcel.repository'
import { findCustomer } from '../../utils/customer.util'

type Options = {
  customercode: string,
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any, options: Options) => {
  let populate = null
  const custCode = options.customercode ? await findCustomer({ code: options.customercode }) : null

  if (options.populate) {
    try {
      populate = JSON.parse(options.populate)
    } catch (error) {
      populate = options.populate.split(',')
    }
  }

  const resp = await ParcelRepository.find(
    {
      ...filter,
      ...(custCode && { 'referrences.parcel.customer': custCode._id }),
    },
    {
      ...options,
      page: options.page || 1,
      limit: options.limit || 5,
      ...(options && options.populate && { populate }),
    },
  )
  return resp
}
