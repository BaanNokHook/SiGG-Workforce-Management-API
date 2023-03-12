import * as os from 'os';
import { Container, Inject } from 'typedi';
import { SccdRescheduling } from '../../../domains/sccd/reschedule';
import { MessageDeserialize } from '../../../libraries/kafkaBroker/consumer';
import {
  IKafkaWorkerConfig,
  KafkaWorker,
} from '../../../libraries/kafkaBroker/kafkaWorker';
import { ILogger } from '../../../libraries/logger/logger.interface';
import { consoleLogger } from '../../../logger';

export class RescheduleStaffsSccdWorker extends KafkaWorker {
  constructor(
    config: IKafkaWorkerConfig,
    @Inject('logger')
    private logger: ILogger = consoleLogger,
    @Inject('SccdRescheduling')
    private sccd: SccdRescheduling = Container.get<SccdRescheduling>(
      SccdRescheduling,
    ),
  ) {
    super(config);
  }

  async onMessage(message: MessageDeserialize) {
    this.logger.info(
      {
        event: `${this.getTopic()}-consume-event-sccd`,
      },
      {
        message: message.value,
        receivedAt: new Date().toISOString(),
        hostname: os.hostname(),
      },
    );
    this.sccd.reschedule(message.value);
  }
}
