// @flow
import R from 'ramda'
import config from '../../../config/index'
import logger from '../../../libraries/logger/index'
import responseTime from '../../../libraries/logger/responseTime'
import { validateData as validateInput } from '../../../utils/validate'
import { type Trip } from '../../../models/implementations/tripRepo'
import { addressDirectionDomain } from '../../address/getAddressDirection'
import { fleetApiService } from '../../../adapters/restClient/fleet'
import { weomniDriver } from '../../weomni/index'

export async function driverIncentiveEarn(trip: Trip) {
  const { tripId, metadata, staffs } = trip
  const logMetadata = {
    event: 'trip_driver_incentive_earn',
    tripId,
    logResponseTimeStart: new Date().getTime(),
  }

  try {
    const orderRef = R.path(['orderId'], metadata)
    const { userId: username } = await fleetApiService.getStaff(R.path(['0'], staffs))
    const { totalTrip, drop, distance, distanceKM } = await addressDirectionDomain.calculateEarn(
      trip,
    )

    const request = {
      orderRef,
      channel: config.weomni.driver.crmChannel,
      token: {
        TRIP: totalTrip,
        DROP: drop,
        KM: distanceKM,
      },
      username,
    }

    validateInput({
      schema: {
        properties: {
          orderRef: {
            type: 'string',
          },
          channel: {
            type: 'string',
          },
          username: {
            type: 'string',
          },
        },
        required: ['orderRef', 'channel', 'username'],
      },
      data: request,
    })

    await weomniDriver.earnsBulk([request])
    logger.info(responseTime(logMetadata), JSON.stringify({ request }))

    return { distance }
  } catch (err) {
    logger.error({ err, ...responseTime(logMetadata) })
    throw err
  }
}
