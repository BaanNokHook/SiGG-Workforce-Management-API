// @flow
import { KafkaConsumer, type MessageDeserialize, type IKafkaConsumerConfig } from './consumer'

export interface IKafkaWorkerConfig {
  bootstrapServers: string;
  consumerGroupId: string;
  topic: string;
  options?: IKafkaConsumerConfig;
}

interface IKafkaWorker {
  start(): void;
  onMessage(message: MessageDeserialize): Promise<any>;
}

export class KafkaWorker implements IKafkaWorker {
  config: IKafkaWorkerConfig
  constructor(config: IKafkaWorkerConfig) {
    process.setMaxListeners(50)
    this.config = config
  }

  start() {
    const consumer = new KafkaConsumer(
      this.config.bootstrapServers,
      this.config.consumerGroupId,
      this.config.topic,
      this.config.options,
    )
    consumer.connect()
    consumer.onMessage((message) => this.onMessage(message))
  }

  async onMessage(message: MessageDeserialize): any {
    throw new Error(`Not Implemented ${message.toString()}`)
  }
}
