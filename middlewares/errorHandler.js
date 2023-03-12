import logger from '../libraries/logger/index'

export default err => {
  logger.error({ err, event: 'error' }, 'Unhandled exception occurred')
}
