import R from 'ramda'
import TripRepository from '../../models/trip.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'
import logger from '../../libraries/logger'

const validate = {
  transactionId: true,
}

export default async function updateMetadata(tripId: string, data: any) {
  isRequiredField({ tripId, ...data }, validate)

  try {
    const trip = await checkFindOne(TripRepository, { _id: tripId })
    const metadata = R.path(['metadata'], trip)
    let tripUpdated
    if (!metadata) {
      tripUpdated = await TripRepository.update(
        { _id: tripId },
        { $set: { metadata: { ...data } } },
        { new: true },
      )
    } else {
      const newMetadata = { ...metadata, ...data }
      tripUpdated = await TripRepository.update(
        { _id: tripId },
        { $set: { metadata: { ...newMetadata } } },
        { new: true },
      )
    }

    logger.info({ event: 'updateTripMetadata' }, { tripId })
    return tripUpdated
  } catch (error) {
    logger.error(error, { event: 'updateTripMetadata' })
    throw new Error(`Update metadata of trip error`)
  }
}
