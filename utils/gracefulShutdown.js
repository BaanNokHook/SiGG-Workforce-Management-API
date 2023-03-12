import logger from '../libraries/logger/index'

export default function gracefulShutdown(name: string, callbackFunction: Function) {
  process.on('SIGTERM', () => {
    logger.info({ event: `graceful_shutdown` }, { name }, 'SIGTERM')
    callbackFunction()
  })
  process.on('SIGINT', () => {
    logger.info({ event: `graceful_shutdown` }, { name }, 'SIGINT')
    callbackFunction()
  })
}
