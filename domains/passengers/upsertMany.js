import { findAndUpdateOrCreate } from '../../utils/domain'
import passengerRepository from '../../models/passengers.repository'

export default async passengers => {
  const upsertPassengers = await Promise.all(
    passengers.map(async passenger => {
      const newPassenger = await findAndUpdateOrCreate(
        passengerRepository,
        { userId: passenger.userId },
        { ...passenger, ...(passenger.userId && { _id: passenger.userId }) },
      )
      return newPassenger
    }),
  )
  return upsertPassengers
}
