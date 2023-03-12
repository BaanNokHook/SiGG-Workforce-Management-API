import { Types } from 'mongoose'
import * as R from 'ramda'
import TaskRepository from '../../models/task.repository'

type Options = {
  limit: number,
  page: number,
  sort?: { [key: string]: 1 | -1 },
  populate?: [
    {
      path?: string,
      select?: string,
    },
  ],
  select?: string,
}

type Query = {
  startTime: string,
  endTime: string,
  staffs: string[],
  companyId: string,
  projectId: string,
  optional: { [key: string]: any },
  convertOptionalObjectId: { path: string[] }[],
}

const getSelectParams = (select) => {
  const results = {}

  select.split(' ').forEach((field) => {
    if (!results[field]) {
      results[field] = 1
    }
  })

  return results
}

export function generateFilter(query: Query) {
  const { startTime, endTime, staffs, companyId, projectId } = query

  const filter = {}

  if (startTime && endTime) {
    filter['windowTime.0'] = { $gte: new Date(startTime) }
    filter['windowTime.1'] = { $lt: new Date(endTime) }
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

const convertToObjectId = ({ path, obj }) => {
  let objectIds = R.path(path, obj)
  if (R.type(objectIds) === 'Array' && objectIds.length > 0) {
    objectIds = objectIds.map((id) => Types.ObjectId(id))
    return R.assocPath(path, objectIds, obj)
  } else if (R.type(objectIds) === 'String') {
    return R.assocPath(path, Types.ObjectId(objectIds), obj)
  }
  return obj
}

export async function findTasks(query: Query, options: Options) {
  const { taskTypeGroups, convertOptionalObjectId = [] } = query
  const { select, limit, page, sort } = options
  let { optional } = query

  const pipeline = []

  if (convertOptionalObjectId.length > 0 && optional) {
    convertOptionalObjectId.forEach(({ path }) => {
      optional = convertToObjectId({ path, obj: optional })
    })
  }

  pipeline.push({
    $match: {
      deleted: false,
      ...generateFilter(query),
      ...optional,
    },
  })

  if (sort) {
    pipeline.push({
      $sort: sort,
    })
  }

  if (taskTypeGroups && taskTypeGroups.length) {
    pipeline.push(
      {
        $lookup: {
          from: 'tasktypes',
          localField: 'taskTypeId',
          foreignField: '_id',
          as: 'taskTypeDetail',
        },
      },
      {
        $unwind: {
          path: '$taskTypeDetail',
          includeArrayIndex: 'taskTypeDetailIndex',
        },
      },
      {
        $match: {
          'taskTypeDetail.taskTypeGroup': {
            $in: taskTypeGroups.map((taskTypeGroup) => Types.ObjectId(taskTypeGroup)),
          },
        },
      },
    )
  }

  if (select) {
    pipeline.push({
      $project: getSelectParams(select),
    })
  }

  const tasks = await TaskRepository.aggregatePaginate(pipeline, {
    page: page || 1,
    limit: limit || 10,
  })

  return tasks
}
