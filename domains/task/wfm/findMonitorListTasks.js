// @flow
import { Types } from 'mongoose'
import TaskRepository, { TASK_STATUS } from '../../../models/task.repository'
import TaskTypeRepository from '../../../models/taskType.repository'

type Query = {
  startTime: string,
  endTime: string,
  staffs: string[],
  areaCodes: string[],
  companyId: string,
  projectId: string,
  optional?: { [key: string]: any },
}

export const WFM_ASSIGN_TASK_STATUS = [
  TASK_STATUS.TODO,
  TASK_STATUS.DOING,
  TASK_STATUS.DONE,
  TASK_STATUS.PENDING,
]
export const WFM_UNASSIGN_TASK_STATUS = [TASK_STATUS.FAILED, TASK_STATUS.NEW]
export const WFM_CANCELLED_TASK_STATUS = TASK_STATUS.CANCELLED

export async function wfmFindMonitorListTasks(query: Query) {
  const {
    startTime,
    endTime,
    staffs,
    areaCodes,
    taskTypeGroups,
    projectId,
    companyId,
    optional,
    selectedFields,
  } = query

  const taskTypes = await TaskTypeRepository.model
    .find({
      taskTypeGroup: { $in: taskTypeGroups },
    })
    .select({ _id: 1 })
  const taskTypeIds = taskTypes.map((taskType) => taskType._id)

  const fields = {
    _id: 1,
    taskId: 1,
    priority: 1,
    staffs: 1,
    orderId: 1,
    status: 1,
    tripId: 1,
    windowTime: 1,
    'information.metaInformation.baseInformation.deadline': 1,
    'information.metaInformation.baseInformation.createUser': 1,
    'information.metaInformation.baseInformation.appointmentTime': 1,
    'information.metaInformation.orderBaseInformation.priority': 1,
    'information.prodType': 1,
    'information.queue': 1,
    geographyId: 1,
    taskStatus: 1,
    ...selectedFields,
  }

  const getUnassigned = async () =>
    TaskRepository.model
      .find({
        deleted: false,
        projectId: Types.ObjectId(projectId),
        companyId: Types.ObjectId(companyId),
        status: { $in: WFM_UNASSIGN_TASK_STATUS },
        'information.metaInformation.areaInformation.areaCode': { $in: areaCodes },
        taskTypeId: { $in: taskTypeIds },
        ...optional,
      })
      .populate([
        { path: 'taskTypeId', select: '_id name durationTime' },
        { path: 'geographyId', select: '_id name type address owner feature' },
      ])
      .sort({ 'information.metaInformation.baseInformation.deadline': 1 })
      .select(fields)
      .limit(100)
      .lean()

  const getAssigned = async () =>
    TaskRepository.model
      .find({
        deleted: false,
        projectId: Types.ObjectId(projectId),
        companyId: Types.ObjectId(companyId),
        'windowTime.0': { $gte: new Date(startTime) },
        'windowTime.1': { $lte: new Date(endTime) },
        status: { $in: WFM_ASSIGN_TASK_STATUS },
        staffs: { $in: staffs.map((staff) => Types.ObjectId(staff)) },
        taskTypeId: { $in: taskTypeIds },
        ...optional,
      })
      .populate([
        { path: 'taskTypeId', select: '_id name durationTime' },
        { path: 'geographyId', select: '_id name type address owner feature' },
      ])
      .sort({ 'information.metaInformation.baseInformation.deadline': 1 })
      .select(fields)
      .limit(100)
      .lean()

  const getCancelled = async () =>
    TaskRepository.model
      .find({
        deleted: false,
        projectId: Types.ObjectId(projectId),
        companyId: Types.ObjectId(companyId),
        updatedAt: { $gte: new Date(startTime), $lte: new Date(endTime) },
        status: WFM_CANCELLED_TASK_STATUS,
        'information.metaInformation.areaInformation.areaCode': { $in: areaCodes },
        taskTypeId: { $in: taskTypeIds },
        ...optional,
      })
      .populate([
        { path: 'taskTypeId', select: '_id name durationTime' },
        { path: 'geographyId', select: '_id name type address owner feature' },
      ])
      .sort({ 'information.metaInformation.baseInformation.deadline': 1 })
      .select(fields)
      .limit(100)
      .lean()

  const [unassigned = [], assigned = [], cancelled = []] = await Promise.all([
    getUnassigned(),
    getAssigned(),
    getCancelled(),
  ])

  return [...unassigned, ...assigned, ...cancelled]
}
