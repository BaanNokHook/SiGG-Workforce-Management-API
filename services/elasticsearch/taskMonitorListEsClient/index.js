import { Client } from '@elastic/elasticsearch'
import logger from '../../../libraries/logger'
import { TASK_MONITOR_LIST } from './mapping'
import { TaskElastic } from '../../../constants/task'
import config from '../../../config'
import { ESClient } from '../index'

export class TaskMonitorListEsClient {
  indexName: string = config.wfm.taskMonitorList.elasticIndex

  constructor() {
    this.client = ESClient.getInstance()
    this.registerMapping()
  }

  async registerMapping() {
    try {
      const { body: exists } = await this.client.indices.exists({ index: this.indexName })
      if (exists) {
        logger.info({ event: 'create_task_monitor_list_mapping' }, 'skip. index exists')
        return
      }

      await this.client.indices.create({
        index: this.indexName,
        body: TASK_MONITOR_LIST,
      })

      logger.info(
        { event: 'create_task_monitor_list_mapping' },
        'create task monitor list mapping successfully',
      )
    } catch (error) {
      logger.error({ event: 'create_task_monitor_list_mapping_error', err: JSON.stringify(error) })
    }
  }

  async index({ mongoTaskId, enrichedTask }) {
    return this.client.index({
      index: this.indexName,
      id: mongoTaskId,
      body: enrichedTask,
    })
  }

  async search({ request, limit }) {
    return this.client.search({
      index: this.indexName,
      body: request,
      size: limit || 100,
    })
  }

  async deleteById({ mongoTaskId }) {
    return this.client.delete({
      index: this.indexName,
      id: mongoTaskId,
    })
  }
}
