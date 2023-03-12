import ParcelRepository from '../../models/parcel.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const resp = await checkFindOne(ParcelRepository, filter, options)
  return resp
}
