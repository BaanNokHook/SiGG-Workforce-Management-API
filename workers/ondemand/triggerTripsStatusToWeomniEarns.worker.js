// @flow
import R from 'ramda'
import { KafkaWorker, type IKafkaWorkerConfig } from '../../libraries/kafka/kafkaWorker'
import { type MessageDeserialize } from '../../libraries/kafka/consumer'
import logger from '../../libraries/logger/index'
import { TripStatus } from '../../constants/trip'
import { type TmsTripValue } from '../type'
import { driverIncentiveEarn } from '../../domains/trip/ondemand/driverIncentiveEarn'
import ondemand from '../../config/ondemand'
import updateTrip from '../../domains/trip/update'

export class TriggerTripsStatusToWeomniEarns extends KafkaWorker {
  constructor(config: IKafkaWorkerConfig) {
    super(config)
  }

  shouldTriggerWeomni(tmsTripValues: TmsTripValue): boolean {
    const { operationType, fullDocument, updateDescription } = tmsTripValues
    const { metadata } = fullDocument

    const isOperationTypeUpdate = operationType === 'update'
    const isStatus = R.path(['updatedFields', 'status'], updateDescription)
    const isOverSla = R.pathOr(false, ['updatedFields', 'metadata.isOverSla'], updateDescription)
    const isDriverIncentive = R.path(
      ['optimized', 'couriers', '0', 'config', 'driver', 'isDriverIncentive'],
      metadata,
    )
    const isEarnIncentiveReason = ondemand.earnIncentiveReason.includes(
      R.path(['driverReject', 'reason'], metadata),
    )

    return (
      isOperationTypeUpdate &&
      isDriverIncentive &&
      !isOverSla &&
      (isStatus === TripStatus.DONE ||
        ((isStatus === TripStatus.REJECTED || isStatus === TripStatus.FAILED) &&
          isEarnIncentiveReason))
    )
  }

  async onMessage(message: MessageDeserialize) {
    const tmsTripValue: TmsTripValue = ((message.value: any): TmsTripValue)

    const { fullDocument } = tmsTripValue
    const { tripId, status } = fullDocument

    const logMetadata = {
      event: this.config.consumerGroupId,
      topic: this.config.topic,
      tripId,
      status,
    }

    try {
      if (!this.shouldTriggerWeomni(tmsTripValue)) return

      const { distance } = await driverIncentiveEarn(fullDocument)
      const response = await updateTrip(
        { tripId },
        {
          'metadata.optimized.direction.distance': distance,
        },
      )

      logger.info(logMetadata, JSON.stringify({ tmsTripValue, response }))
    } catch (err) {
      logger.error({ err, ...logMetadata }, JSON.stringify(tmsTripValue))
    }
  }
}
