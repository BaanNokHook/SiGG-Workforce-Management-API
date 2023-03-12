// @flow
import * as R from 'ramda'
import logger from '../../libraries/logger'
import { addressApiService } from '../../adapters/restClient/address'
import { type Trip } from '../../models/implementations/tripRepo'
import { type ITaskRepo, taskRepo } from '../../models/implementations/taskRepo'
import { getDistance, getVehicleTypeByTrip, getGeographyIdsByTasks } from '../../utils/address.util'
import { groupWayPoints } from '../../utils/geography.util'
import { validateData as validateInput } from '../../utils/validate'

type CalculateEarnResponse = {
  totalTrip: number,
  drop: number,
  distance: number,
  distanceKM?: number,
}

export class AddressDirectionDomain {
  TaskRepository: ITaskRepo

  constructor(TaskRepository: ITaskRepo) {
    this.TaskRepository = TaskRepository
  }

  async getWayPointsByTrip(trip: Trip) {
    const { tripId, tasks: tasksIds } = trip
    const logMetadata = {
      event: 'address_get_way_point',
      tripId,
    }

    try {
      const tasks = await this.TaskRepository.getTaskByIds(tasksIds)
      const geographyIds = getGeographyIdsByTasks(R.path(['data'], tasks))
      const wayPoints = await Promise.all(await groupWayPoints(geographyIds))

      return JSON.stringify(wayPoints)
    } catch (err) {
      logger.error({ err, ...logMetadata })
      throw err
    }
  }

  async calculateEarn(trip: Trip): Promise<CalculateEarnResponse> {
    const { tripId } = trip
    const logMetadata = {
      event: 'address_direction_calculate_earn',
      tripId,
    }

    const request = {
      engine: 'OSRM',
      wayPoints: await this.getWayPointsByTrip(trip),
      mode: getVehicleTypeByTrip(trip),
    }

    try {
      const getDirection = await addressApiService.getDirection(request)
      const directionFeatures = R.path(['data', 'metadata', 'direction', 'features'], getDirection)
      const drop = R.length(directionFeatures)

      const { distance, distanceKM } = getDistance(directionFeatures, 'km')
      logger.info(logMetadata, JSON.stringify({ request }))

      return {
        totalTrip: 1,
        drop,
        distance,
        distanceKM,
      }
    } catch (err) {
      logger.error({ err, ...logMetadata }, JSON.stringify(request))
      throw err
    }
  }
}

export const addressDirectionDomain = new AddressDirectionDomain(taskRepo)
