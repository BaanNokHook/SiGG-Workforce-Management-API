// @flow
import R from 'ramda'
import logger from '../../libraries/logger'
import { type MessageDeserialize } from '../../libraries/kafka/kafkaWorker'
import { KafkaWorker, type IKafkaWorkerConfig } from '../../libraries/kafka/kafkaWorker'
import { TaskMonitorListEsClient } from '../../services/elasticsearch/taskMonitorListEsClient'
import { enrichESTask } from '../../domains/task/wfm/enrichESTask'
import wfm from '../../config/wfm'

export class TaskMonitorList extends KafkaWorker {
  constructor(config: IKafkaWorkerConfig) {
    super(config)
    this.esClient = new TaskMonitorListEsClient()
  }

  async onMessage(message: MessageDeserialize) {
    try {
      const {
        value: { fullDocument, documentKey, operationType },
      } = message

      if (['insert', 'replace', 'update'].includes(operationType)) {
        const mongoTaskId = fullDocument._id
        const taskId = fullDocument.taskId

        const projectIds = Object.values(wfm.PROJECT_ID)

        const isValidProject = projectIds.includes(fullDocument.projectId)
        const isValidCompany = fullDocument.companyId === wfm.COMPANY_ID
        const isDeleted = fullDocument.deleted

        if (isDeleted) {
          await this.esClient.deleteById({ mongoTaskId })
        }

        if (!isValidProject || !isValidCompany || isDeleted) return
        const enrichedTask = await enrichESTask(mongoTaskId)
        await this.esClient.index({
          mongoTaskId,
          enrichedTask,
        })
        return
      } else {
        const mongoTaskId = documentKey._id
        await this.esClient.deleteById({ mongoTaskId })
      }
    } catch (err) {
      logger.error({
        err,
        event: this.config.consumerGroupId,
      })
    }
  }
}
