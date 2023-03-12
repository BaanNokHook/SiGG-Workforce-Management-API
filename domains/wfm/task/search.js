// @flow
import * as R from 'ramda'
import { TaskMonitorListEsClient } from '../../../services/elasticsearch/taskMonitorListEsClient'
import { TASK_STATUS } from '../../../models/task.repository'
import type { SearchInput } from './type'
import logger from '../../../libraries/logger/index'

export const WFM_ASSIGN_TASK_STATUS = [
  TASK_STATUS.TODO,
  TASK_STATUS.DOING,
  TASK_STATUS.DONE,
  TASK_STATUS.PENDING,
  TASK_STATUS.RETURNED,
]
export const WFM_UNASSIGN_TASK_STATUS = [TASK_STATUS.FAILED, TASK_STATUS.NEW]
export const WFM_CANCELLED_TASK_STATUS = TASK_STATUS.CANCELLED

export class WfmTasksSearch {
  constructor(_esClient: TaskMonitorListEsClient) {
    this.esClient = _esClient
    this.logger = logger
  }

  removeNull(array: { [key: string]: any }[]) {
    return array.filter((item) => item)
  }

  generateOptionalsQuery(queryData: any, key: string) {
    const skipQuery = ['staffs', 'areaCodes', 'startTime', 'endTime', 'installationTeamIds']
    if (skipQuery.includes(key)) return null

    const queryValue = queryData[key]

    if (key === 'taskTypeGroups' && Array.isArray(queryValue) && queryValue.length > 0) {
      return {
        terms: {
          taskTypeGroupId: queryValue,
        },
      }
    }

    return { match: { [`${key}.keyword`]: queryData[key] } }
  }

  generateAssuranceAreaCodeQuery(queryValue: any) {
    return {
      bool: {
        must: [
          {
            terms: {
              areaCode: queryValue,
            },
          },
          {
            term: {
              sourceSystem: 'assurance',
            },
          },
        ],
      },
    }
  }

  generateInstallationTeamIdsQuery(queryValue: any) {
    return {
      bool: {
        must: [
          {
            terms: {
              teamId: queryValue,
            },
          },
          {
            term: {
              sourceSystem: 'installation',
            },
          },
        ],
      },
    }
  }

  generateUnassignedTaskQuery(queryData: any) {
    let assuranceAreaCodesQuery = []
    let installationTeamIdsQuery = []
    let query: any[] = []
    Object.keys(queryData).forEach((key: string) => {
      const queryValue = queryData[key]
      if (key === 'areaCodes' && Array.isArray(queryValue) && queryValue.length > 0) {
        const areaCodesQuery = this.generateAssuranceAreaCodeQuery(queryValue)
        assuranceAreaCodesQuery.push(areaCodesQuery)
      } else if (
        key === 'installationTeamIds' &&
        Array.isArray(queryValue) &&
        queryValue.length > 0
      ) {
        const teamIdsQuery = this.generateInstallationTeamIdsQuery(queryValue)
        installationTeamIdsQuery.push(teamIdsQuery)
      } else {
        query.push(this.generateOptionalsQuery(queryData, key))
      }
    })

    const statusesQuery = {
      bool: {
        should: WFM_UNASSIGN_TASK_STATUS.map((status) => ({
          match: { status },
        })),
      },
    }

    const areaCodesAndInstallationTeamIdsQuery = {
      bool: {
        should: [...assuranceAreaCodesQuery, ...installationTeamIdsQuery],
      },
    }

    query.push(areaCodesAndInstallationTeamIdsQuery)
    query.push(statusesQuery)
    return this.removeNull(query)
  }

  generateAssignedTaskQuery(queryData: any) {
    const query = Object.keys(queryData).map((key: string) => {
      const queryValue = queryData[key]
      if (key === 'startTime' && queryValue) {
        return { range: { planStartTime: { gte: new Date(queryValue) } } }
      }
      if (key === 'endTime' && queryValue) {
        return { range: { planFinishTime: { lte: new Date(queryValue) } } }
      }

      if (key === 'staffs' && Array.isArray(queryValue) && queryValue.length > 0) {
        return {
          terms: {
            staffId: queryValue,
          },
        }
      }

      return this.generateOptionalsQuery(queryData, key)
    })

    const statusesQuery = {
      bool: {
        should: WFM_ASSIGN_TASK_STATUS.map((status) => ({
          match: { status },
        })),
      },
    }

    query.push(statusesQuery)
    return this.removeNull(query)
  }

  generateCancelledTaskQuery(queryData: any) {
    let assuranceAreaCodesQuery = []
    let installationTeamIdsQuery = []
    let query: any = []
    Object.keys(queryData).forEach((key: string) => {
      const queryValue = queryData[key]
      if (key === 'startTime' && queryValue) {
        query.push({ range: { updatedAt: { gte: new Date(queryValue) } } })
      } else if (key === 'endTime' && queryValue) {
        query.push({ range: { updatedAt: { lte: new Date(queryValue) } } })
      } else if (key === 'areaCodes' && Array.isArray(queryValue) && queryValue.length > 0) {
        const areaCodesQuery = this.generateAssuranceAreaCodeQuery(queryValue)
        assuranceAreaCodesQuery.push(areaCodesQuery)
      } else if (
        key === 'installationTeamIds' &&
        Array.isArray(queryValue) &&
        queryValue.length > 0
      ) {
        const teamIdsQuery = this.generateInstallationTeamIdsQuery(queryValue)
        installationTeamIdsQuery.push(teamIdsQuery)
      } else {
        query.push(this.generateOptionalsQuery(queryData, key))
      }
    })

    const statusesQuery = {
      match: { status: WFM_CANCELLED_TASK_STATUS },
    }

    const areaCodesAndInstallationTeamIdsQuery = {
      bool: {
        should: [...assuranceAreaCodesQuery, ...installationTeamIdsQuery],
      },
    }

    query.push(areaCodesAndInstallationTeamIdsQuery)
    query.push(statusesQuery)
    return this.removeNull(query)
  }

  mapTasksResponse(tasksEs: any[] = []) {
    return tasksEs.map((item: any) => ({
      _id: item._id,
      ...item._source,
    }))
  }

  selectFields(selectedFields: { [key: string]: any }) {
    const defaultSelects = [
      'taskId',
      'priorityName',
      'priority',
      'staffs',
      'orderId',
      'status',
      'tripId',
      'windowTime',
      'deadline',
      'createUser',
      'taskTypeGroupName',
      'customerAddress',
      'prodType',
      'queue',
      'sourceSystem',
      'tracking',
      'ruleType',
    ]

    const _selectedFields = selectedFields ? Object.keys(selectedFields) : []
    return [...defaultSelects, ..._selectedFields]
  }

  async search({ bodyRequest, options }: SearchInput): Promise<any> {
    const { limit = 100, page = 1, selectedFields } = options

    this.logger.info({
      event: 'wfm-search-task-es',
      request: JSON.stringify({ bodyRequest, options }),
    })

    const assignedTaskQuery = this.generateAssignedTaskQuery(bodyRequest)

    const query = [
      {
        bool: {
          must: assignedTaskQuery,
        },
      },
    ]

    if (
      (Array.isArray(bodyRequest.areaCodes) && bodyRequest.areaCodes.length > 0) ||
      (Array.isArray(bodyRequest.installationTeamIds) && bodyRequest.installationTeamIds.length > 0)
    ) {
      const unAssignTaskQuery = this.generateUnassignedTaskQuery(bodyRequest)
      const cancelledTaskQuery = this.generateCancelledTaskQuery(bodyRequest)
      const unAssignedAndCanceledQuery = [
        {
          bool: {
            must: unAssignTaskQuery,
          },
        },
        {
          bool: {
            must: cancelledTaskQuery,
          },
        },
      ]
      query.push(...unAssignedAndCanceledQuery)
    }

    const selects = this.selectFields(selectedFields)

    try {
      const result = await this.esClient.search({
        request: {
          query: {
            bool: {
              should: query,
            },
          },
          sort: [
            {
              statusSequence: 'asc',
            },
            {
              deadline: 'desc',
            },
          ],
          from: (page - 1) * limit,
          _source: selects,
        },
        limit,
      })

      const data = R.path(['body', 'hits', 'hits'], result)
      const total = R.pathOr(0, ['body', 'hits', 'total'], result)
      const taskResult = this.mapTasksResponse(data)

      return {
        data: taskResult,
        total,
        limit,
        page,
        hasNext: page * limit < total,
        numberOfPage: Math.ceil(total / limit),
      }
    } catch (err) {
      this.logger.error({ err, event: 'wfm-search-task-es' })
      throw err
    }
  }
}
