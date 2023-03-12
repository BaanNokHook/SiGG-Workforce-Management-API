import TripRepository from '../../models/trip.repository'
import { checkUpdate, checkFindOne } from '../../utils/domain'

export default async (filter: any, data: any) => {
  await checkFindOne(TripRepository, filter)
  const response = await checkUpdate(TripRepository, filter, {
    ...data,
  })

  return response
}
