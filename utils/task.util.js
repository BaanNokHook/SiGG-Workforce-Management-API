// @flow
import R from 'ramda'
import { type Task } from '../models/implementations/taskRepo'
import {
  TASK_STATUS,
  TASK_STATUS_COMPLETED,
  LIST_TASK_STATUS_CANCELLED,
} from '../models/task.repository'

export function isTaskAcceptTrip(taskTypeCode: string) {
  const [taskTypeAcceptTrip] = R.match(/accept_trip|ACCEPT_TRIP|acceptTrip/g, taskTypeCode)
  return taskTypeAcceptTrip
}

export function isAllTaskCompleted(tasks: Task[]) {
  const completedTasks = tasks.filter((task) => TASK_STATUS_COMPLETED.includes(task.status))
  return completedTasks.length === tasks.length
}

export function isTaskPickup(taskTypeCode: string) {
  const [taskTypePickup] = R.match(/pickup|PICKUP|pick_up|PICK_UP/g, taskTypeCode)
  return taskTypePickup
}

export function isTaskDelivery(taskTypeCode: string) {
  const [taskTypeDelivery] = R.match(/delivery|DELIVERY/g, taskTypeCode)
  return taskTypeDelivery
}

export function isTaskReturn(taskTypeCode: string) {
  const [taskTypeReturn] = R.match(/return|RETURN/g, taskTypeCode)
  return taskTypeReturn
}

export function isSomeTaskDelivered(tasks: Task[]) {
  return tasks.some((task: Task) => {
    const { status: taskStatus, taskTypeId } = task
    const isTaskDone = taskStatus === TASK_STATUS.DONE
    return isTaskDone && isTaskDelivery(taskTypeId.code)
  })
}

export function isSomeTaskCancelled(tasks: Task[]) {
  return tasks.some((task: Task) => LIST_TASK_STATUS_CANCELLED.includes(task.status))
}

export function filterDeliveryTasks(tasks: Task[]) {
  return tasks.filter((task) => isTaskDelivery(task.taskTypeId.code))
}

export function getRefOrderIds(task?: Task) {
  if (!task) return null

  const parcels = task.information && task.information.parcels
  if (!parcels) return null

  const refOrderIds = parcels.map((parcel) => parcel.refOrderId).filter(Boolean)

  if (!refOrderIds.length) return null
  const uniqRefOrderIds: string[] = [...new Set(refOrderIds)]
  return uniqRefOrderIds
}
