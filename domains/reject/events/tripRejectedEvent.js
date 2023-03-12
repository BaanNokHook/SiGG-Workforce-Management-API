import TripUpdate from '../../trip/update'
import logger from '../../../libraries/logger'

export default async (tripId, data) => {
  await TripUpdate(
    { _id: tripId },
    {
      $set: {
        status: 'FAILED',
      },
      $push: { rejectRequest: data._id },
    },
  )
  logger.info({ event: 'TRIP_REJECT', tripId })
}
