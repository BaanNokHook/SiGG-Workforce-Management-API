// @flow
import { promisify } from 'util'
import Kafka, { type Message } from 'node-rdkafka'
import gracefulShutdown from '../../utils/gracefulShutdown'
import { jsonTryParse } from '../../utils/request'
import logger from '../logger/index'

export const delay = promisify(setTimeout)

export class KafkaRetryExhausted extends Error {}

export interface IKafkaConsumerConfig {
  autoOffReset: 'smallest' | 'earliest' | 'beginning' | 'largest' | 'latest' | 'end' | 'error';
  enableAutoCommit: boolean;
  retry: number;
  retryDelay: number;
  maximumPollingMessages: number;
}

export type MessageKey = Buffer | string | null
export type MessageHeader = { [key: string]: string | Buffer }
export type MessageValue = Buffer | null

export interface LibrdKafkaError {
  message: string;
  code: number;
  errno: number;
  origin: string;
  stack?: string;
}

export interface MessageKafka {
  value: MessageValue;
  size: number;
  topic: string;
  key?: MessageKey;
  timestamp?: number;
  headers?: MessageHeader[];
  opaque?: any;
  offset: number;
  topic: string;
  partition: number;
}

export interface MessageDeserialize {
  value: { [key: string]: any } | string;
  size: number;
  topic: string;
  key: string;
  timestamp: number;
  headers: MessageHeader[];
  offset: number;
  topic: string;
  partition: number;
}

export interface TopicPartition {
  topic: string;
  partition: number;
}

export interface TopicPartitionOffset extends TopicPartition {
  offset: number;
}

export type Assignment = TopicPartition | TopicPartitionOffset

export class KafkaConsumer {
  topic: string

  consumerGroupId: string

  consumer: Kafka.KafkaConsumer

  _isConnected: boolean

  _configWithDefault: IKafkaConsumerConfig

  _callbackFn: Function

  constructor(
    bootstrapServers: string,
    consumerGroupId: string,
    topic: string,
    config?: IKafkaConsumerConfig,
  ) {
    this.topic = topic
    this.consumerGroupId = consumerGroupId
    this._isConnected = false
    this._configWithDefault = this.buildConfig(((config: any): IKafkaConsumerConfig))

    this.consumer = new Kafka.KafkaConsumer(
      {
        'group.id': consumerGroupId,
        'metadata.broker.list': bootstrapServers,
        'enable.auto.commit': this._configWithDefault.enableAutoCommit,
        'session.timeout.ms': 10000, // (retry * retryDelay) + 1000
        'heartbeat.interval.ms': 3000,
      },
      {
        'auto.offset.reset': this._configWithDefault.autoOffReset,
      },
    )
  }

  buildConfig(config: IKafkaConsumerConfig): IKafkaConsumerConfig {
    const initialConfig = {
      autoOffReset: 'latest',
      enableAutoCommit: false,
      retry: 3,
      retryDelay: 10000,
      maximumPollingMessages: 100,
    }
    const prepareConfig = Object.assign({}, initialConfig, config)
    return prepareConfig
  }

  isConnected(): boolean {
    return this._isConnected
  }

  getName(): string {
    return `${this.consumerGroupId}_${this.topic}`
  }

  getConfig(): IKafkaConsumerConfig {
    return this._configWithDefault
  }

  connect() {
    this.consumer.connect()
    this.consumer.on('ready', async () => {
      this._isConnected = true
      this.consumer.subscribe([this.topic])
      logger.info({ event: `${this.getName()}_kafka_consumer` }, `kafka consumer start poll`)
      this.poll()
      logger.info({ event: `${this.getName()}_kafka_consumer` }, `kafka consumer connected`)
      gracefulShutdown(this.getName(), () => this.disconnect())
    })

    this.consumer.on('disconnected', () => {
      logger.info(
        { event: `${this.getName()}_kafka_consumer_disconnected` },
        'consumer disconnected',
      )
    })
  }

  disconnect() {
    logger.info({ event: `${this.getName()}_kafka_consumer_disconnect` }, 'disconnect consumer')
    this._isConnected = false
    this.consumer.unsubscribe()
    this.consumer.disconnect()
  }

  deserialize(message: MessageKafka): MessageDeserialize {
    const messageKey =
      message.key === null ? null : jsonTryParse(((message.key: any): Buffer).toString())
    const messageDeserialize = Object.assign({}, message, {
      value: jsonTryParse(((message.value: any): Buffer).toString()),
      key: messageKey,
    })
    return ((messageDeserialize: any): MessageDeserialize)
  }

  isPromise(result: any) {
    return result != null && typeof result.then === 'function'
  }

  async consumeMessage(
    messageDeserialize: MessageDeserialize,
    callbackFn: Function,
    retryCount: number = 0,
  ): Promise<void> {
    try {
      const result = callbackFn(messageDeserialize)
      if (this.isPromise(result)) {
        await result
      }
    } catch (err) {
      logger.error({ event: `${this.getName()}_kafka_on_message`, err })
      const { retry, retryDelay } = this.getConfig()

      if (retryCount < retry) {
        logger.info(
          { event: `${this.getName()}_kafka_on_message` },
          `retry: ${retryCount + 1} of ${retry} (delay: ${retryDelay})`,
        )
        await delay(retryDelay)
        await this.consumeMessage(messageDeserialize, callbackFn, retryCount + 1)
      } else {
        throw new KafkaRetryExhausted('Failure retry process message')
      }
    }
  }

  async handleMessage(message: Message): Promise<void> {
    const messageDeserialize: MessageDeserialize = this.deserialize(message)
    try {
      await this.consumeMessage(messageDeserialize, this._callbackFn)
    } catch (err) {
      logger.error({ event: `${this.getName()}_kafka_on_message`, err })
    } finally {
      const { enableAutoCommit } = this.getConfig()
      if (!enableAutoCommit) {
        this.commitMessageSync(message)
      }
    }
  }

  async commitMessageSync(message: Message): void {
    try {
      if (!this.isConnected()) {
        return
      }
      this.consumer.commitMessageSync(message)
    } catch (err) {
      logger.error({ event: `${this.getName()}_kafka_commit_error`, err })
      // Delay before retrying commit
      await delay(1000)
      this.commitMessageSync(message)
    }
  }

  async consume(): Promise<Message[]> {
    const { maximumPollingMessages } = this._configWithDefault
    return new Promise((resolve) => {
      this.consumer.consume(maximumPollingMessages, (err: LibrdKafkaError, messages: Message[]) => {
        if (err) {
          logger.error({ event: `${this.getName()}_kafka_consume_message_error`, err })
          resolve([])
        } else {
          resolve(messages)
        }
      })
    })
  }

  async poll(): Promise<void> {
    while (this.isConnected()) {
      // eslint-disable-next-line no-await-in-loop
      const messages = await this.consume()
      const hasMessages = messages.length > 0
      if (hasMessages) {
        // eslint-disable-next-line no-restricted-syntax
        for (const message of messages) {
          // eslint-disable-next-line no-await-in-loop
          await this.handleMessage(message)
        }
      }
    }
  }

  onMessage(cb: Function) {
    this._callbackFn = cb
  }
}
