import * as Kafka from 'node-rdkafka';
import { config } from '../../bootstrapConfig';

export const KafkaProducer = new Kafka.Producer({
  'client.id': 'kafka',
  'metadata.broker.list': config.kafka.KAFKA_URL,
  'compression.codec': 'gzip',
  'retry.backoff.ms': 200,
  'message.send.max.retries': 10,
  'socket.keepalive.enable': true,
  'queue.buffering.max.messages': 10000000,
  'queue.buffering.max.ms': 1000,
  'batch.num.messages': 1000000,
  dr_cb: true,
  'message.max.bytes': 10000000,
});

// export const KafkaConsumer = new Kafka.KafkaConsumer(
//   {
//     'group.id': 'test',
//     'metadata.broker.list': config.kafka.KAFKA_URL,
//     'session.timeout.ms': 10000, // (retry * retryDelay) + 1000
//     'heartbeat.interval.ms': 3000,
//   },
//   {},
// );
