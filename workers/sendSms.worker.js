// @flow
import R from 'ramda'
import logger from '../libraries/logger/index'
import { type MessageDeserialize } from '../libraries/kafka/consumer'
import { KafkaWorker, type IKafkaWorkerConfig } from '../libraries/kafka/kafkaWorker'
import { type ISmsApiService } from '../adapters/restClient/sms'
import { type IUrlShortenApiService } from '../adapters/restClient/urlShorten'
import { type TmsTodoValue } from './type'
import { type ITaskRepo, type Task } from '../models/implementations/taskRepo'

export class SmsWorker extends KafkaWorker {
  webTrackingUri: string
  SmsApiService: ISmsApiService
  UrlShortenApiService: IUrlShortenApiService
  TaskRepo: ITaskRepo
  smsSourceNumber: string

  constructor(
    config: IKafkaWorkerConfig,
    webTrackingUri: string,
    SmsApiService: ISmsApiService,
    UrlShortenApiService: IUrlShortenApiService,
    TaskRepo: ITaskRepo,
    smsSourceNumber: string,
  ) {
    super(config)
    this.webTrackingUri = webTrackingUri
    this.SmsApiService = SmsApiService
    this.UrlShortenApiService = UrlShortenApiService
    this.TaskRepo = TaskRepo
    this.smsSourceNumber = smsSourceNumber
  }

  shouldSendSms(message: MessageDeserialize): boolean {
    const todo: TmsTodoValue = ((message.value: any): TmsTodoValue)
    const { metadata = {} } = todo.fullDocument
    const { taskTypeCode = '' } = metadata

    const isOperationTypeUpdate = todo.operationType === 'update'
    const isUpdateFieldStatus = Boolean(
      R.pathOr(null, ['updateDescription', 'updatedFields', 'status'], todo),
    )
    const isDeliveryTask = taskTypeCode.split('_').includes('DELIVERY')
    const isSetoffTodo = todo.fullDocument.isStart

    return isOperationTypeUpdate && isUpdateFieldStatus && isDeliveryTask && isSetoffTodo
  }

  async getTask(mongoTaskId: string): Promise<Task> {
    const task = await this.TaskRepo.getTaskById(mongoTaskId, [{ path: 'tripId' }])
    return task
  }

  async sendSms(message: MessageDeserialize) {
    const todo: TmsTodoValue = ((message.value: any): TmsTodoValue)
    const { taskId: mongoTaskId } = todo.fullDocument

    const task = await this.getTask(mongoTaskId)
    const { orderId, metadata: tripMetadata } = task.tripId

    const { phone: recipientPhoneNumber } = task.information
    const trackingUri = await this.UrlShortenApiService.generateUrl({
      url: `${this.webTrackingUri}/recipient/tracking/${orderId}/${task.taskId}`,
    })
    const smsMessage =
      tripMetadata && tripMetadata.orderId
        ? `ติดตามสถานะการส่ง ${tripMetadata.orderId} คลิก ${trackingUri}`
        : `ติดตามสถานะการส่ง คลิก ${trackingUri}`

    await this.SmsApiService.sendSms({
      senderTitle: 'DRIVS',
      destinationNumber: recipientPhoneNumber,
      sourceNumber: this.smsSourceNumber,
      message: smsMessage,
    })
  }

  async onMessage(message: MessageDeserialize) {
    const todo: TmsTodoValue = ((message.value: any): TmsTodoValue)
    const { _id: todoId, metadata = {} } = todo.fullDocument

    try {
      if (!this.shouldSendSms(message)) {
        return
      }

      await this.sendSms(message)

      logger.info({
        event: this.config.consumerGroupId,
        topic: this.config.topic,
        ...metadata,
        todoId,
      })
      return
    } catch (err) {
      logger.error({
        err,
        event: this.config.consumerGroupId,
        topic: this.config.topic,
        ...metadata,
        todoId,
      })
    }
  }
}
