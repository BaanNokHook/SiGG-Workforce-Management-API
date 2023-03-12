// @flow
import * as R from 'ramda'
import { TaskMonitorListEsClient } from '../../../services/elasticsearch/taskMonitorListEsClient'
import taskRepository from '../../../models/task.repository'
import logger from '../../../libraries/logger/index'

export class SyncTaskData {
  constructor(_esClient: TaskMonitorListEsClient) {
    this.esClient = _esClient
    this.logger = logger
  }

  async validateIdsWithIndexingSource(taskIdsToCompare, startTimeQuery, offSetTimeQuery) {
    let taskResponse
    try {
      taskResponse = await this.esClient.search({
        request: {
          query: {
            bool: {
              must: {
                terms: { _id: taskIdsToCompare },
              },
              filter: {
                range: {
                  updatedAt: {
                    format: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
                    gte: startTimeQuery,
                    lte: offSetTimeQuery,
                  },
                },
              },
            },
          },
        },
      })
    } catch (err) {
      this.logger.error({ err, event: 'wfm-sync-task-data-validate-ids-source' })
      throw err
    }

    const tasksIndex = taskResponse?.body?.hits?.hits
    const tasksIndexIds = tasksIndex?.map((task) => task._id)
    const missingTaskIds = R.difference(taskIdsToCompare, tasksIndexIds)
    return missingTaskIds
  }

  async batchProcessReIndexing({ startTime, offSetTime, companyId, projectId }) {
    const startTimeQuery = startTime ? new Date(startTime) : new Date()
    const offSetTimeQuery = offSetTime
      ? new Date(offSetTime)
      : new Date(startTimeQuery.getTime() + 1 * 60 * 60 * 1000)

    let tasksSource
    try {
      tasksSource = await taskRepository.model
        .find({
          deleted: false,
          companyId,
          projectId,
          $and: [{ updatedAt: { $gte: startTimeQuery } }, { updatedAt: { $lte: offSetTimeQuery } }],
        })
        .select({
          _id: 1,
        })
    } catch (err) {
      this.logger.error({ err, event: 'wfm-sync-task-data-batch-process-find-tasks' })
      throw err
    }

    const taskIdsToCompare = tasksSource.map((task) => String(task._id))

    const missingTaskIds = await this.validateIdsWithIndexingSource(
      taskIdsToCompare,
      startTimeQuery,
      offSetTimeQuery,
    )

    if (missingTaskIds && missingTaskIds.length) {
      try {
        await taskRepository.model.updateMany(
          { _id: { $in: missingTaskIds } },
          { $set: { 'metadata.reIndexAt': new Date() } },
        )
      } catch (err) {
        this.logger.error({ err, event: 'wfm-sync-task-data-batch-process-update-many' })
        throw err
      }
    }

    return {
      taskIdsToReIndex: missingTaskIds,
    }
  }
}
