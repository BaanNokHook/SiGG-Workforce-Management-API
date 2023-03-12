import tripRepository from '../../models/trip.repository'
import { findOneAndRestore } from '../../utils/domain'

export default async (tripId: string) => {
  const filter = { _id: tripId }
  const response = await findOneAndRestore(tripRepository, filter)
  return response
}
