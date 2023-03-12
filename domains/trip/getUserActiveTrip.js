import tripRepository from '../../models/trip.repository'
import { NotFound } from '../../constants/error'
import { fleetApiService } from '../../adapters/restClient/fleet'
import logger from '../../libraries/logger/index'

async function getStaff(userId: string) {
  try {
    const staff = await fleetApiService.getStaff(userId)
    logger.info({ event: 'GET_STAFF_BY_USER_ID', userId })
    return staff
  } catch (error) {
    logger.error({ event: 'GET_STAFF_BY_USER_ID', userId, err: error })
    throw error
  }
}

export async function getUserActiveTrip(userId: string) {
  const { _id: staffId } = await getStaff(userId)

  const trip = await tripRepository.findOne({
    $and: [{ staffs: staffId }, { status: 'DOING' }],
  })

  if (!trip) {
    logger.error({ event: 'GET_ACTIVE_TRIP', userId })
    throw new NotFound('trip not found')
  }

  logger.info({ event: 'GET_ACTIVE_TRIP', userId })

  return trip
}
