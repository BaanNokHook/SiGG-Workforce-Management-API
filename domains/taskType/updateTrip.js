// @flow
import { type Todo } from '../../models/implementations/todoRepo'
import { type ITripRepo, type TripStatus } from '../../models/implementations/tripRepo'
import { getRefOrderStatuses } from '../../utils/trip.util'
import { getRefOrderIds } from '../../utils/task.util'
import { TRIP_STATUS } from '../../models/trip.repository'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'

type UpdateTripDetailStatus = {
  tripId: string,
  tripStatus?: TripStatus,
  TripRepo: ITripRepo,
  todo: Todo,
}

export async function updateTripDetailStatus({
  TripRepo,
  tripId,
  tripStatus = TRIP_STATUS.DOING,
  todo,
}: UpdateTripDetailStatus) {
  const { _id: todoId, todoType } = todo
  const todoTypeCode = todoType.code

  const { taskId, taskTypeId } = todo.taskId
  const taskTypeCode = taskTypeId.code

  const logMetadata = {
    event: 'update_trip_detail_status',
    todoId,
    taskId,
    tripId,
    logResponseTimeStart: new Date().getTime(),
  }

  // only combined order do process getRefOrderStatuses
  const refOrderIds = getRefOrderIds(todo.taskId)
  const trip = refOrderIds
    ? await TripRepo.getTripById(tripId, {
        populate: [
          {
            path: 'tasks',
            populate: [
              {
                path: 'taskTypeId',
              },
            ],
          },
        ],
      })
    : {}
  const refOrderStatuses = refOrderIds ? getRefOrderStatuses(trip.tasks, refOrderIds) : null

  const detailStatusMetadata = {
    taskId,
    taskTypeCode,
    todoId,
    todoTypeCode,
    // only combined order have value refOrderTripStatus
    refOrderStatuses,
  }

  logger.info(responseTime(logMetadata), detailStatusMetadata)

  if (todoTypeCode === 'PICKED_UP') {
    return TripRepo.update(tripId, {
      detailStatus: `${taskTypeCode}.${todoTypeCode}.${tripStatus}`,
      pickedUpTime: new Date(),
      status: tripStatus,
      detailStatusMetadata,
    })
  }

  if (tripStatus === TRIP_STATUS.DONE) {
    return TripRepo.update(tripId, {
      detailStatus: `${taskTypeCode}.${todoTypeCode}.${tripStatus}`,
      deliveredTime: new Date(),
      status: tripStatus,
      detailStatusMetadata,
    })
  }

  return TripRepo.update(tripId, {
    detailStatus: `${taskTypeCode}.${todoTypeCode}.${tripStatus}`,
    status: tripStatus,
    detailStatusMetadata,
  })
}
