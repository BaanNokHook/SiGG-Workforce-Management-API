import R from 'ramda'
import config from '../../config'
import kafka from '../../libraries/kafka'
import logger from '../../libraries/logger/index'

export type ProduceInput = {
  topic: string,
  key: string,
  payload: any,
}

class KafkaProducerAdapter {
  constructor() {
    this.producer = kafka
  }

  connect() {
    this.producer.connect()
    this.producer
      .on('ready', () => {
        logger.info({ event: 'kafka is connected' })
      })
      .on('event.error', (error: Error) => {
        logger.error({ err: error, event: 'kafka is connected' })
      })
  }

  produce(props: ProduceInput) {
    const { topic, payload, key } = props
    const topicNameFromConfig = R.path(['kafka', 'topic', 'staging', 'tmsTodo'], config)
    try {
      this.producer.produce(topic, null, Buffer.from(JSON.stringify(payload)), key, Date.now())
      logger.info({ event: 'produce message' }, JSON.stringify({ topic, topicNameFromConfig }))
    } catch (error) {
      logger.info(
        { err: error, event: 'produce message' },
        JSON.stringify({ topic, topicNameFromConfig }),
      )
    }
  }
}

export default new KafkaProducerAdapter()
