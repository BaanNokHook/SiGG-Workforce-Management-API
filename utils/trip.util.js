// @flow
import R from 'ramda'
import { type Task } from '../models/implementations/taskRepo'
import { type TripStatus } from '../models/implementations/tripRepo'
import { isSomeTaskDelivered, isSomeTaskCancelled } from './task.util'
import {
  TRIP_STATUS,
  LIST_TRIP_STATUS_FAILED,
  TRIP_STATUS_COMPLETED,
} from '../models/trip.repository'
import { TASK_STATUS } from '../models/task.repository'

export function isTripStatusCancelled(tripStatus: TripStatus): boolean {
  return LIST_TRIP_STATUS_FAILED.includes(tripStatus)
}

export function isTripStatusCompleted(tripStatus: TripStatus): boolean {
  return TRIP_STATUS_COMPLETED.includes(tripStatus)
}

export function getTripStatus(tasks: Task[], requestUpdateTripStatus: TripStatus): TripStatus {
  if (isSomeTaskDelivered(tasks) && isTripStatusCancelled(requestUpdateTripStatus)) {
    return TRIP_STATUS.PARTIAL_DONE
  }

  if (
    isSomeTaskDelivered(tasks) &&
    isSomeTaskCancelled(tasks) &&
    requestUpdateTripStatus === TRIP_STATUS.DONE
  ) {
    return TRIP_STATUS.PARTIAL_DONE
  }

  return requestUpdateTripStatus
}

export function getRefOrderTripStatus(tasks: Task[]): TripStatus {
  const _isTripFailed = tasks.some((task) => task.status === TASK_STATUS.FAILED)
  if (_isTripFailed) {
    return getTripStatus(tasks, TRIP_STATUS.FAILED)
  }

  const isTripCanceled = tasks.some((task) => task.status === TASK_STATUS.CANCELLED)
  if (isTripCanceled) {
    return getTripStatus(tasks, TRIP_STATUS.CANCELLED)
  }

  const isTripRejected = tasks.some((task) => task.status === TASK_STATUS.REJECTED)
  if (isTripRejected) {
    return getTripStatus(tasks, TRIP_STATUS.REJECTED)
  }

  const isTripDoing = tasks.some((task) => task.status === TASK_STATUS.DOING)
  if (isTripDoing) {
    return getTripStatus(tasks, TRIP_STATUS.DOING)
  }

  const isTripDone =
    tasks.filter((task) => task.status === TASK_STATUS.DONE).length === tasks.length
  if (isTripDone) {
    return getTripStatus(tasks, TRIP_STATUS.DONE)
  }

  return getTripStatus(tasks, TRIP_STATUS.PENDING)
}

type RefOrdersTripStatus = { refOrderId: string, status: TripStatus }

export function getRefOrderStatuses(
  tasks: Task[],
  refOrderIds: string[] | null,
): RefOrdersTripStatus[] | null {
  if (!refOrderIds || !refOrderIds.length) return null

  const refOrdersTripStatus = refOrderIds.map((refOrderId) => {
    const refOrderTasks = tasks.filter((task) => {
      const parcels = task.information && task.information.parcels
      if (!parcels) return false
      return parcels.find((parcel) => refOrderId === parcel.refOrderId)
    })
    const status = getRefOrderTripStatus(refOrderTasks)
    return { refOrderId, status }
  })

  return refOrdersTripStatus
}

export function isAllowedToMultipleAcceptTrip(tripMetadata: any) {
  const isAllowedDriverAcceptMultipleJob = R.path(
    ['config', 'driver', 'isAllowToMultipleAcceptTrip'],
    tripMetadata,
  )
  return Boolean(isAllowedDriverAcceptMultipleJob)
}

export function getMultipleAcceptTripLimit(tripMetadata: any) {
  return R.path(['config', 'driver', 'multipleAcceptTripLimit'], tripMetadata)
}
