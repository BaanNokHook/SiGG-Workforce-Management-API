// @flow
import { Types } from 'mongoose'
import moment from 'moment'
import TaskRepository, { TASK_STATUS } from '../../../models/task.repository'

type Query = {
  startTime: string,
  endTime: string,
  staffs: string[],
  areaCodes: string[],
  companyId: string,
  projectId: string,
  optional?: { [key: string]: any },
}

export async function findSLASummary(query: Query) {
  const { startTime, endTime, staffs, areaCodes, projectId, companyId, optional } = query
  const currentTime = moment().utc()
  const currentTimeString = currentTime.format('YYYY-MM-DD HH:mm:ss')
  const currentTimeAfter15MinString = moment(currentTime)
    .add(15, 'minutes')
    .format('YYYY-MM-DD HH:mm:ss')

  const assignedTaskFilter = {
    staffs: { $in: staffs },
    'windowTime.0': { $gte: new Date(startTime) },
    'windowTime.1': { $lt: new Date(endTime) },
    projectId,
    companyId,
    deleted: false,
  }

  const getAssignedTaskTimeOutStatus = TaskRepository.model
    .find({
      ...assignedTaskFilter,
      $expr: {
        $cond: {
          if: { $eq: ['$status', TASK_STATUS.DONE] },
          then: {
            $gt: [
              {
                $dateToString: {
                  format: '%Y-%m-%d %H:%M:%S',
                  date: '$completedAt',
                },
              },
              '$information.metaInformation.baseInformation.deadline',
            ],
          },
          else: {
            $gt: [currentTimeString, '$information.metaInformation.baseInformation.deadline'],
          },
        },
      },
      ...optional,
    })
    .count()

  const getAssignedTaskWarningStatus = TaskRepository.model
    .find({
      ...assignedTaskFilter,
      $expr: {
        $cond: {
          if: { $eq: ['$status', TASK_STATUS.DONE] },
          then: {
            $and: [
              {
                $gt: [
                  {
                    $dateToString: {
                      format: '%Y-%m-%d %H:%M:%S',
                      date: { $add: ['$completedAt', 15 * 60000] },
                    },
                  },
                  '$information.metaInformation.baseInformation.deadline',
                ],
              },
              {
                $lt: [
                  {
                    $dateToString: {
                      format: '%Y-%m-%d %H:%M:%S',
                      date: '$completedAt',
                    },
                  },
                  '$information.metaInformation.baseInformation.deadline',
                ],
              },
            ],
          },
          else: {
            $and: [
              {
                $gt: [
                  currentTimeAfter15MinString,
                  '$information.metaInformation.baseInformation.deadline',
                ],
              },
              {
                $lt: [currentTimeString, '$information.metaInformation.baseInformation.deadline'],
              },
            ],
          },
        },
      },
      ...optional,
    })
    .count()

  const getAssignedTaskNormalStatus = TaskRepository.model
    .find({
      ...assignedTaskFilter,
      $expr: {
        $cond: {
          if: { $eq: ['$status', TASK_STATUS.DONE] },
          then: {
            $lte: [
              {
                $dateToString: {
                  format: '%Y-%m-%d %H:%M:%S',
                  date: { $add: ['$completedAt', 15 * 60000] },
                },
              },
              '$information.metaInformation.baseInformation.deadline',
            ],
          },
          else: {
            $lte: [
              currentTimeAfter15MinString,
              '$information.metaInformation.baseInformation.deadline',
            ],
          },
        },
      },
      ...optional,
    })
    .count()

  const unassignedTaskFilter = {
    'information.metaInformation.areaInformation.areaCode': {
      $in: areaCodes,
    },
    staffs: [],
    $or: [{ tripId: { $exists: false } }, { tripId: null }],
    projectId,
    companyId,
    deleted: false,
    status: { $in: [TASK_STATUS.FAILED, TASK_STATUS.PENDING] },
  }

  const getUnassignedTaskTimeOutStatus = TaskRepository.model
    .find({
      ...unassignedTaskFilter,
      'information.metaInformation.baseInformation.deadline': { $lt: currentTimeString },
      ...optional,
    })
    .count()

  const getUnassignedTaskWarningStatus = TaskRepository.model
    .find({
      ...unassignedTaskFilter,
      $and: [
        {
          'information.metaInformation.baseInformation.deadline': {
            $lt: currentTimeAfter15MinString,
          },
        },
        { 'information.metaInformation.baseInformation.deadline': { $gt: currentTimeString } },
      ],
      ...optional,
    })
    .count()

  const getUnassignedTaskNormalStatus = TaskRepository.model
    .find({
      ...unassignedTaskFilter,
      'information.metaInformation.baseInformation.deadline': {
        $gt: currentTimeAfter15MinString,
      },
      ...optional,
    })
    .count()

  const cancelledTaskFilter = {
    'information.metaInformation.areaInformation.areaCode': {
      $in: areaCodes,
    },
    staffs: [],
    $or: [{ tripId: { $exists: false } }, { tripId: null }],
    projectId,
    companyId,
    deleted: false,
    status: TASK_STATUS.CANCELLED,
    $and: [{ updatedAt: { $gte: new Date(startTime) } }, { updatedAt: { $lt: new Date(endTime) } }],
  }

  const getCancelledTaskTimeOutStatus = TaskRepository.model
    .find({
      ...cancelledTaskFilter,
      'information.metaInformation.baseInformation.deadline': { $lt: currentTimeString },
      ...optional,
    })
    .count()

  const getCancelledTaskWarningStatus = TaskRepository.model
    .find({
      ...cancelledTaskFilter,
      $and: [
        {
          'information.metaInformation.baseInformation.deadline': {
            $lt: currentTimeAfter15MinString,
          },
        },
        { 'information.metaInformation.baseInformation.deadline': { $gt: currentTimeString } },
      ],
      ...optional,
    })
    .count()

  const getCancelledTaskNormalStatus = TaskRepository.model
    .find({
      ...cancelledTaskFilter,
      'information.metaInformation.baseInformation.deadline': {
        $gt: currentTimeAfter15MinString,
      },
      ...optional,
    })
    .count()

  const [
    assignedTaskTimeOutStatus = 0,
    assignedTaskWarningStatus = 0,
    assignedTaskNormalStatus = 0,
    unassignedTaskTimeOutStatus = 0,
    unassignedTaskWarningStatus = 0,
    unassignedTaskNormalStatus = 0,
    cancelledTaskTimeOutStatus = 0,
    cancelledTaskWarningStatus = 0,
    cancelledTaskNormalStatus = 0] = await Promise.all([
      getAssignedTaskTimeOutStatus,
      getAssignedTaskWarningStatus,
      getAssignedTaskNormalStatus,

      getUnassignedTaskTimeOutStatus,
      getUnassignedTaskWarningStatus,
      getUnassignedTaskNormalStatus,

      getCancelledTaskTimeOutStatus,
      getCancelledTaskWarningStatus,
      getCancelledTaskNormalStatus,
    ])


  const summary = {
    assigned: {
      timeout: assignedTaskTimeOutStatus,
      warning: assignedTaskWarningStatus,
      normal: assignedTaskNormalStatus,
    },
    unassigned: {
      timeout: unassignedTaskTimeOutStatus,
      warning: unassignedTaskWarningStatus,
      normal: unassignedTaskNormalStatus,
    },
    cancelled: {
      timeout: cancelledTaskTimeOutStatus,
      warning: cancelledTaskWarningStatus,
      normal: cancelledTaskNormalStatus,
    },
    summary: {
      timeout: assignedTaskTimeOutStatus + unassignedTaskTimeOutStatus + cancelledTaskTimeOutStatus,
      warning: assignedTaskWarningStatus + unassignedTaskWarningStatus + cancelledTaskWarningStatus,
      normal: assignedTaskNormalStatus + unassignedTaskNormalStatus + cancelledTaskNormalStatus,
    },
  }

  return summary
}
