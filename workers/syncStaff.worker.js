// @flow
import R from 'ramda'
import logger from '../libraries/logger/index'
import { type MessageDeserialize } from '../libraries/kafka/consumer'
import { KafkaWorker, type IKafkaWorkerConfig } from '../libraries/kafka/kafkaWorker'
import { type IStaffRepo } from '../models/implementations/staffRepo'

export class SyncStaff extends KafkaWorker {
  StaffRepo: IStaffRepo

  constructor(config: IKafkaWorkerConfig, StaffRepo: IStaffRepo) {
    super(config)
    this.StaffRepo = StaffRepo
  }

  async onMessage(message: MessageDeserialize) {
    const tmsStaffValue: TmsStaffValue = ((message.value: any): TmsStaffValue)
    const staff = tmsStaffValue.fullDocument
    try {
      logger.info(
        {
          event: this.config.consumerGroupId,
          staffId: staff._id,
        },
        JSON.stringify(staff),
      )

      await this.StaffRepo.upsert(staff)
      return
    } catch (err) {
      logger.error({
        err,
        event: this.config.consumerGroupId,
        staffId: staff._id,
      })
    }
  }
}
