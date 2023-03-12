import TripRepository from '../../models/trip.repository'

export default async (filter, data) => {
  const tripUpdated = await TripRepository.model.update(filter, data)
  return tripUpdated
}
