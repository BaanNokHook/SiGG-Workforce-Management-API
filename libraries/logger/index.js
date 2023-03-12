import bunyan from 'bunyan'
import config from '../../config'

const options = {
  ...config.log,
  serializers: bunyan.stdSerializers,
}
const logger = bunyan.createLogger(options)

if (process.env.NODE_ENV === 'test') {
  logger.level(bunyan.FATAL + 1)
}

export default logger
