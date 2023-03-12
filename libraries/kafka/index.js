import * as Kafka from 'node-rdkafka'
import config from '../../config'

const { kafka } = config

export default new Kafka.Producer({
  'client.id': 'kafka',
  'metadata.broker.list': kafka.uri,
  'compression.codec': 'gzip',
  'retry.backoff.ms': 200,
  'message.send.max.retries': 10,
  'socket.keepalive.enable': true,
  'queue.buffering.max.messages': 10000000,
  'queue.buffering.max.ms': 1000,
  'batch.num.messages': 1000000,
  dr_cb: true,
  'message.max.bytes': 10000000,
})
