// @flow
import R from 'ramda'
import { KafkaWorker, type IKafkaWorkerConfig } from '../../libraries/kafka/kafkaWorker'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type MessageDeserialize } from '../../libraries/kafka/consumer'
import logger from '../../libraries/logger/index'
import { type FmsAppointmentValue } from '../type'

export class WfmSyncAppointmentToTaskWorker extends KafkaWorker {
  TaskRepo: ITaskRepo

  constructor(config: IKafkaWorkerConfig, TaskRepo: ITaskRepo) {
    super(config)
    this.TaskRepo = TaskRepo
  }

  shouldUpdateTask(appointment: FmsAppointmentValue): boolean {
    const isOperationTypeUpdate = appointment.operationType === 'update'

    const appointmentFields = ['appointmentFrom', 'appointmentTo']
    const updatedFields = R.pathOr({}, ['updateDescription', 'updatedFields'], appointment)
    const interestedField = Object.keys(updatedFields).find((key) =>
      appointmentFields.includes(key),
    )

    return isOperationTypeUpdate && Boolean(interestedField)
  }

  buildPayload(appointment: FmsAppointmentValue) {
    const { appointmentFrom, appointmentTo } = appointment.fullDocument
    return {
      windowTime: [appointmentFrom, appointmentTo],
    }
  }

  async onMessage(message: MessageDeserialize) {
    const appointmentValue: FmsAppointmentValue = (message.value: any)
    const { appointmentNo } = appointmentValue.fullDocument
    const logMetadata = {
      event: this.config.consumerGroupId,
      topic: this.config.topic,
      appointmentNo,
    }
    try {
      if (!this.shouldUpdateTask(appointmentValue)) return

      const payload = this.buildPayload(appointmentValue)
      await this.TaskRepo.update({ appointmentNo }, payload)

      logger.info(logMetadata, JSON.stringify(appointmentValue))
    } catch (err) {
      logger.error({ err, ...logMetadata }, JSON.stringify(appointmentValue))
    }
  }
}
