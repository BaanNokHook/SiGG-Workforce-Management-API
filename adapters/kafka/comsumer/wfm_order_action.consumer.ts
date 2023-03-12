import { Container, Inject } from 'typedi';
import { UpdateStatusExternalDomain } from '../../../domains/order/updateStatusExternal/updateStatusExternal.domain';
import {
  IKafkaWorkerConfig,
  KafkaWorker,
} from '../../../libraries/kafkaBroker/kafkaWorker';
import { IUpdatedFields, MessageDeserialize } from './interface';

export class OrderActionWorker extends KafkaWorker {
  constructor(
    config: IKafkaWorkerConfig,
    @Inject('UpdateStatusExternalDomain')
    private updateStatusExternalDomain: UpdateStatusExternalDomain = Container.get<
      UpdateStatusExternalDomain
    >(UpdateStatusExternalDomain),
  ) {
    super(config);
  }

  shouldUpdate(updatedFields: IUpdatedFields): boolean {
    if (!updatedFields) {
      return false;
    }
    const trackKeyRegex = /^orderStatuses\.\d/;
    const _shouldUpdate = Object.keys(updatedFields).some((key) => {
      return trackKeyRegex.test(key);
    });

    return _shouldUpdate;
  }

  async onMessage(message: MessageDeserialize) {
    const updatedFields = message?.value?.updateDescription?.updatedFields;
    const shouldUpdate = this.shouldUpdate(updatedFields);
    if (shouldUpdate) {
      const order = message.value.fullDocument;
      this.updateStatusExternalDomain.update(order, updatedFields);
    }
  }
}
