// @flow
import R from 'ramda'
import config from '../../config'
import logger from '../logger/index'
import { ensureConfigKeys } from '../../utils/configUtil'

type ConnectionAMQP = {
  url: string,
}

type RascalConfig = {
  uris: string,
  user: string,
  password: string,
}

function mappingAmqpConfigConnection(rascalConfig: RascalConfig): Array<ConnectionAMQP> {
  ensureConfigKeys(rascalConfig, 'uris', 'user', 'password')

  const { uris, user, password } = rascalConfig
  return uris
    .split(',')
    .map((uri: string): ConnectionAMQP => ({ url: uri.replace(`://`, `://${user}:${password}@`) }))
}

const exchanges = [
  {
    name: `tms-flow.caller`,
    type: 'fanout',
    options: {
      durable: true,
    },
  },
  {
    name: `tms-service.update_transport_status`,
    type: 'topic',
    options: {
      durable: true,
    },
  },
]

const setupQueue = () => {
  const setup = {
    queues: {},
    subscriptions: {},
    publications: {},
    bindings: [],
  }

  const subscribeConfig = {
    queueList: [
      { queue: `tms-service.transport`, option: { durable: true } },
      { queue: `more_staff_request_is_approved`, option: { durable: true } },
    ],
  }

  const publishConfig = {
    queueList: [
      {
        exchange: `tms-service.update_transport_status`,
        queue: `tms-service.update_transport_trip_status`,
        option: { durable: true },
      },
      {
        exchange: `tms-service.update_transport_status`,
        queue: `4pl-tms.task_updated`,
        option: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'tms-service.update_transport_status',
            'x-dead-letter-routing-key': '4pl-tms.task_updated.error',
          },
        },
      },
    ],
  }

  // Setup queues
  R.forEach((data) => {
    setup.queues[`${data.queue}`] = { options: data.option }
  }, R.concat(subscribeConfig.queueList, publishConfig.queueList))
  logger.info({ event: 'setup queues' })

  // Setup publications
  R.forEach((data) => {
    setup.publications[`${data.queue}`] = {
      exchange: data.exchange,
      routingKey: data.queue,
    }
    setup.bindings = [...setup.bindings, `${data.exchange}[${data.queue}] -> ${data.queue}`]
  }, publishConfig.queueList)
  logger.info({ event: 'setup publications' })

  // Setup subscriptions
  R.forEach((data) => {
    setup.subscriptions[data.queue] = { queue: `${data.queue}` }
  }, subscribeConfig.queueList)
  logger.info({ event: 'setup subscriptions' })

  return setup
}

const rascalConfig = {
  vhosts: {
    config: {
      connections: mappingAmqpConfigConnection(config.rascal),
      exchanges,
      ...setupQueue(),
    },
  },
}

export default rascalConfig
