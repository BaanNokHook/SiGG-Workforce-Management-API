import Broker from 'rascal'
import fs from 'fs'
import rascalConfig from './rascalConfig'
import logger from '../logger'

let broker = null

const initBroker = () => Broker.BrokerAsPromised.create(Broker.withDefaultConfig(rascalConfig))

const init = async (dirname) => {
  try {
    broker = await initBroker()
    const APP_DIR = `${dirname}/services/rascal/subscribes`
    const receiversPath = fs.readdirSync(APP_DIR)

    receiversPath.forEach(async (file) => {
      if (!file.match(/.subscribe.js.map/g)) {
        const path = `${APP_DIR}/${file}`
        const subscribers = require(path)
        subscribers.init(broker)
      }
    })
    logger.info({ event: 'START_RASCAL' })
  } catch (error) {
    logger.info({ event: 'START_RASCAL', err: error })
    process.exit(0)
  }
}

export { broker }
export default init
