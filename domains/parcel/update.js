import ParcelRepository from '../../models/parcel.repository'
import { checkUpdate, checkFindOne } from '../../utils/domain'

export default async (filter: any, data: any) => {
  await checkFindOne(ParcelRepository, filter)
  const resp = await checkUpdate(ParcelRepository, filter, data)
  return resp
}
