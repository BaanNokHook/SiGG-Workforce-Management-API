// @flow
import R from 'ramda'
import { VEHICLE_DIRECTION, VEHICLE_TYPE } from '../../constants/geography'
import geographyRepo from '../../models/geography.repository'
import { type Trip, tripRepo } from '../../models/implementations/tripRepo'
import { type Task } from '../../models/implementations/taskRepo'
import { TASK_DELIVERY_STATUS } from '../../models/task.repository'
import addressHttpService from '../../services/httpService/address'
import { HttpMethodConstant } from '../../utils/baseHttp.util'
import { isRequiredField } from '../../utils/domain'
import logger from '../../libraries/logger/index'
import { NotFound, ValidateError } from '../../constants/error'

type CoordinatesLngLat = [Number, Number]

type RequestUpdateDirection = {
  coordinates: CoordinatesLngLat,
  vehicleType?: 'CAR' | 'MOTORCYCLE',
  geographyTypeId: string,
}

export default async function updateDirection(tripId: string, data: RequestUpdateDirection) {
  const { coordinates, geographyTypeId, vehicleType = VEHICLE_TYPE.CAR } = data
  isRequiredField(
    { tripId, geographyTypeId, coordinates, vehicleType },
    { tripId: true, coordinates: true, vehicleType: true, geographyTypeId: true },
  )

  const trip: Trip = await tripRepo.getTripById(tripId, {
    populate: [{ path: 'tasks', populate: [{ path: 'geographyId' }] }],
  })

  if (!trip.tasks || trip.tasks.length === 0) {
    logger.error({
      event: 'FAIL_UPDATE_DIRECTION_TO_TRIP',
      err: `Not Found task within tripId : ${tripId}`,
    })
    throw new NotFound(`Not Found task within tripId : ${tripId}`)
  }

  const tasksSortedWithoutProcessDeliveryStatus = (trip.tasks: Task[])
    .filter((task) => task.deliveryStatus !== TASK_DELIVERY_STATUS.PROCESS)
    .sort((taskA, taskB) => taskA.sequenceSystem - taskB.sequenceSystem)

  const geographyPoints = tasksSortedWithoutProcessDeliveryStatus.map((task: Task) => {
    const [lng = 0, lat = 0] = R.path(['feature', 'geometry', 'coordinates'], task.geographyId)
    return [lng, lat]
  })

  const points = [coordinates, ...geographyPoints]
  const shouldNotHasLatLngEqualZeroNumber = points.some(([lng, lat]) => lat === 0 && lng === 0)
  if (shouldNotHasLatLngEqualZeroNumber) {
    throw new ValidateError(
      `Invalid points has lat and lng equal zero number ${JSON.stringify(points)}`,
    )
  }

  const prepareWaypoints = points.map(([longitude, latitude]) => ({ latitude, longitude }))
  const wayPoints = JSON.stringify(prepareWaypoints)
  const avoidsDirection = VEHICLE_DIRECTION[vehicleType]

  const logMetadata = {
    wayPoints: prepareWaypoints,
    geographyTypeId,
  }

  try {
    const response = await addressHttpService.request({
      method: HttpMethodConstant.GET,
      url: `direction?&wayPoints=${wayPoints}&avoidsDirection=${avoidsDirection}&geographyType=${geographyTypeId}`,
      headers: null,
    })

    const direction = response.data.data
    await geographyRepo.create({
      ...direction,
      referenceGeographyId: direction._id,
    })

    const tripUpdated = await tripRepo.updateDirectionsByTripId(tripId, direction._id)
    return tripUpdated
  } catch (error) {
    if (error.response) {
      logger.error({
        err: error.response.data || error,
        event: 'FAIL_REQUEST_DIRECTION',
        msg: logMetadata,
      })
      throw error.response.data.payload
    }

    logger.error({
      err: error,
      event: 'FAIL_UPDATE_DIRECTION_TO_TRIP',
      msg: logMetadata,
    })
    throw error
  }
}
