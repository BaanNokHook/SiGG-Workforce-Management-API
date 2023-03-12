// @flow
import R from 'ramda'
import { KafkaWorker, type IKafkaWorkerConfig } from '../../libraries/kafka/kafkaWorker'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type MessageDeserialize } from '../../libraries/kafka/consumer'
import logger from '../../libraries/logger/index'
import { type MessageValue, type ICloseWorkOrder } from '../type'

const STATUS_CLOSE_WORK_ORDER = 'COMPLETED'

export class SyncCloseWorkOrderToTaskWorker extends KafkaWorker {
  TaskRepo: ITaskRepo

  constructor(config: IKafkaWorkerConfig, TaskRepo: ITaskRepo) {
    super(config)
    this.TaskRepo = TaskRepo
  }

  shouldUpdateTask(messageValue: MessageValue<ICloseWorkOrder>): boolean {
    const isUpdate = messageValue.operationType === 'update'
    const orderId = messageValue.fullDocument.workOrderNo || ''

    return isUpdate && Boolean(orderId)
  }

  isCloseWorkOrderSuccess(messageValue: MessageValue<ICloseWorkOrder>): boolean {
    return messageValue.fullDocument.status === STATUS_CLOSE_WORK_ORDER
  }

  buildPayload(messageValue: MessageValue<ICloseWorkOrder>) {
    const closeWorkOrder = messageValue.fullDocument
    return {
      $set: {
        'information.closeWorkOrderResult': {
          success: this.isCloseWorkOrderSuccess(messageValue),
          refWorkOrderNo: closeWorkOrder.refWorkOrderNo,
          requestCode: closeWorkOrder.requestCode,
          closeCode: closeWorkOrder.closeCode,
          reasonCode: closeWorkOrder.reasonCode,
          attributeList: closeWorkOrder.attributeList,
          imageList: closeWorkOrder.imageList,
          snAttributeList: closeWorkOrder.snAttributeList,
          testSignalPass: closeWorkOrder.testSignalPass,
          remark: closeWorkOrder.remark,
        },
        'metadata.isLeavable': this.isCloseWorkOrderSuccess(messageValue)
      },
    }
  }

  async onMessage(message: MessageDeserialize) {
    const closeWorkOrderValue: MessageValue<ICloseWorkOrder> = (message.value: any)
    const closeWorkOrder = closeWorkOrderValue.fullDocument
    const logMetadata = {
      event: this.config.consumerGroupId,
      topic: this.config.topic,
      orderId: closeWorkOrder.workOrderNo,
    }
    try {
      if (!this.shouldUpdateTask(closeWorkOrderValue)) return

      const filter = {
        orderId: closeWorkOrder.workOrderNo,
        deleted: false,
      }
      const payload = this.buildPayload(closeWorkOrderValue)
      await this.TaskRepo.update(filter, payload)

      logger.info(logMetadata, JSON.stringify(closeWorkOrderValue))
    } catch (err) {
      logger.error({ err, ...logMetadata }, JSON.stringify(closeWorkOrderValue))
    }
  }
}
