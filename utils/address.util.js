// @flow
import R from 'ramda'
import config from '../config/index'
import { TASK_DELIVERY_STATUS } from '../models/task.repository'
import { type Task } from '../models/implementations/taskRepo'
import { type Trip } from '../models/implementations/tripRepo'

const filterDeliveryStatus = [TASK_DELIVERY_STATUS.PICK_UP, TASK_DELIVERY_STATUS.DELIVER]

export function getVehicleTypeByTrip(trip: Trip) {
  const { metadata } = trip
  const vehicleType = R.path(['optimized', 'couriers', '0', 'vehicleTypes', '0', 'name'], metadata)

  let vehicle = 'car'
  if (!vehicleType) {
    vehicle = ''
  } else if (vehicleType.toLowerCase() === 'motorcycle') {
    vehicle = 'motorcycle'
  }
  return vehicle
}

export function getGeographyIdsByTasks(tasks: Task[]) {
  return tasks
    .filter((tasks) => filterDeliveryStatus.includes(tasks.deliveryStatus))
    .map((tasks) => tasks.geographyId)
}

export function getDistance(directionFeatures: Object[], unit: string) {
  let result = {}
  const distance = directionFeatures
    .map((features) => features.properties.distance)
    .reduce((arrDistance, distance) => arrDistance + distance)

  if (unit === 'km') {
    result.distanceKM = distance / 1000
  }

  return { distance, ...result }
}
