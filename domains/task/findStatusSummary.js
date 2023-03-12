// @flow
import { Types } from 'mongoose'
import TaskRepository, { TASK_STATUS } from '../../models/task.repository'

type Options = {
  limit?: number,
  page?: number,
}

type Query = {
  startTime?: string,
  endTime?: string,
  staffs?: string[],
  companyId?: string,
  projectId?: string,
  optional?: { [key: string]: any },
}

type TaskSummary = {
  _id: TASK_STATUS,
  total: number,
}

type TodoSummary = {
  _id: string,
  total: number,
  realTotal: number,
}

type TaskStatusSummary = {
  task: TaskSummary[],
  todo: TodoSummary[],
}

type Filter = {
  'windowTime.0'?: Date,
  'windowTime.1'?: Date,
  staffs?: Types.ObjectId[],
  companyId?: Types.ObjectId,
  projectId?: Types.ObjectId,
}

const WFM_SPECIFIC_SUM_OF_TODO_TYPES = [
  {
    case: {
      $and: [
        { $eq: ['$todoTypeDetail.name', 'SET_OFF'] },
        { $gte: [{ $size: '$todoTypeList' }, 1] },
        { $setIsSubset: ['$todoTypeList.name', ['SET_OFF', 'E2E', 'TAKE_A_PHOTO']] },
      ],
    },
    then: 1,
  },
  {
    case: {
      $and: [
        { $eq: ['$todoTypeDetail.name', 'ENTER_SITE'] },
        { $gte: [{ $size: '$todoTypeList' }, 2] },
        {
          $setEquals: [
            {
              $setIntersection: ['$todoTypeList.name', ['SET_OFF', 'ENTER_SITE']],
            },
            ['SET_OFF', 'ENTER_SITE'],
          ],
        },
      ],
    },
    then: 1,
  },
  {
    case: {
      $and: [
        { $ne: ['$todoTypeDetail.name', 'ENTER_SITE'] },
        { $ne: ['$todoTypeDetail.name', 'SET_OFF'] },
      ],
    },
    then: 1,
  },
]

export function generateFilter(query: Query): Filter {
  const { staffs, companyId, projectId } = query

  const filter = {}

  if (query.startTime && query.endTime) {
    filter['windowTime.0'] = { $gte: new Date(query.startTime) }
    filter['windowTime.1'] = { $lt: new Date(query.endTime) }
  }

  if (staffs && staffs.length > 0) {
    filter['staffs'] = { $in: staffs.map((staff) => Types.ObjectId(staff)) }
  }

  if (companyId && projectId) {
    filter['companyId'] = Types.ObjectId(companyId)
    filter['projectId'] = Types.ObjectId(projectId)
  }

  return filter
}

export async function findStatusSummary(query: Query, options: Options): TaskStatusSummary {
  const { optional } = query
  const { limit, page } = options

  const filter = generateFilter(query)

  const aggregatePipeline = []

  aggregatePipeline.push({
    $match: {
      deleted: false,
      ...filter,
      ...optional,
    },
  })

  if (page && page > 1) {
    aggregatePipeline.push({
      $skip: limit * (page - 1),
    })
  }

  if (limit) {
    aggregatePipeline.push({
      $limit: limit,
    })
  }

  aggregatePipeline.push(
    {
      $facet: {
        task: [
          {
            $group: {
              _id: '$status',
              total: { $sum: 1 },
            },
          },
        ],
        todo: [
          {
            $match: {
              status: TASK_STATUS.DOING,
              track: { $exists: true, $ne: [] },
            },
          },
          {
            $lookup: {
              from: 'todos',
              localField: 'track.todo',
              foreignField: '_id',
              as: 'todoDetail',
            },
          },
          {
            $lookup: {
              from: 'todotypes',
              localField: 'todoDetail.todoType',
              foreignField: '_id',
              as: 'todoTypeDetail',
            },
          },
          {
            $lookup: {
              from: 'todotypes',
              localField: 'todoDetail.todoType',
              foreignField: '_id',
              as: 'todoTypeList',
            },
          },
          { $unwind: '$todoTypeDetail' },
          {
            $group: {
              _id: '$todoTypeDetail.name',
              title: { $first: '$todoTypeDetail.title' },
              actualTotal: { $sum: 1 },
              total: {
                $sum: {
                  $switch: {
                    branches: [...WFM_SPECIFIC_SUM_OF_TODO_TYPES],
                    default: 0,
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        task: '$task',
        todo: '$todo',
      },
    },
  )

  const summary = await TaskRepository.aggregate(aggregatePipeline)
  return summary[0] || {}
}
