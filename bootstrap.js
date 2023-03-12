import path from 'path'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import compress from 'koa-compress'
import cors from '@koa/cors'
import { load } from '@spksoft/koa-decorator'
import gracefulShutdown from 'http-graceful-shutdown'
import { setOptions } from 'koa-session-getter'
import { loggingMiddleware, configLogger } from 'graylog-koa-client'
import * as R from 'ramda'
import { initJaegerClient } from 'tel-monitoring-kit'
import mongooseClient from './libraries/database/client/mongoose'
import config from './config'
import logger from './libraries/logger'
import { NotFoundError, ErrorCode } from './libraries/error'
import initData from './seeds/init'
import ConductorClient from './libraries/conductor'
import rabbitMQ from './libraries/rabbitMq'
import { accessLogger, errorCatcher, responseHandler, requestId, errorHandler } from './middlewares'
import KafkaProducerAdapter from './adapters/kafkaBroker/kafkaProducerAdapter'
import { ensureConfigKeys } from './utils/configUtil'
import useGlobalLogger from './bootstrap/useGlobalLogger'
import useRoutingController from './bootstrap/useRoutingController'
import useTranslator from './bootstrap/useTranslator'

configLogger({
  host: R.path(['graylog', 'host'], config),
  port: R.path(['graylog', 'port'], config),
  service: R.path(['graylog', 'service'], config),
  env: R.path(['env'], config),
})

setOptions({
  url: `${config.routeHttp.authUrl}/v2/sessions`,
  userUrl: `${config.routeHttp.authUrl}/v1/users/find`,
  authorizationPath: ['request', 'header', 'authorization'],
  sessionPath: ['user'],
  httpOptions: {
    timeout: 5000,
  },
})

const app = new Koa()
const translator = useTranslator()

app.use(
  bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb',
  }),
)
app.use(compress())
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    exposeHeaders: ['X-Request-Id'],
  }),
)
app.use(requestId())
app.use(loggingMiddleware)
app.use(responseHandler())
app.use(errorCatcher(translator))
app.on('error', errorHandler)
app.use(accessLogger({ logger }))

// load router
const apiRouter = load(path.resolve(__dirname, 'controllers'), '.controller.js')
app.use(apiRouter.routes())
app.use(
  // use middle ware instance
  apiRouter.allowedMethods({
    throw: true,
    notImplemented: () =>
      new NotFoundError(
        'The resquested uri does not match to any route tables',
        ErrorCode.URI_NOT_FOUND.CODE,
      ),
    methodNotAllowed: () =>
      new NotFoundError(
        'The resquested uri does not match to any route tables',
        ErrorCode.URI_NOT_FOUND.CODE,
      ),
  }),
)

useGlobalLogger(logger)
useRoutingController(app)

if (config.database) {
  ensureConfigKeys(config.database, 'uri', 'dbName', 'user', 'pass')

  mongooseClient(config.database)
    .then((dbClient) => {
      logger.info({
        event: 'mongo_connect',
        dbName: dbClient.name,
        port: dbClient.port,
        host: dbClient.host,
      })
      initJaegerClient()
      ConductorClient(__dirname)
      rabbitMQ(__dirname)
      KafkaProducerAdapter.connect()
    })
    .catch((err) => {
      logger.error(err, { event: 'mongo_connect' })
      process.exit(1)
    })
  initData()
}

const server = app.listen(config.system.port, () => {
  logger.info({ event: 'execute' }, `API server listening on ${config.system.port}`)
})

gracefulShutdown(server)
