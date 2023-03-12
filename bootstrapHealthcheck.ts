import { load } from '@spksoft/koa-decorator'
import gracefulShutdown from 'http-graceful-shutdown'
import Koa from 'koa'
import path from 'path'

import config from './config'
import logger from './libraries/logger'

logger.info({ event: 'bootstrap_healthcheck' }, `start http-server`)

const app = new Koa()
const apiRouter = load(path.resolve(__dirname, 'controllers'), 'system.controller.js')
app.use(apiRouter.routes())
const server = app.listen(config.system.port, () => {
  logger.info({ event: 'bootstrap_healthcheck' }, `API server listening on ${config.system.port}`)
})

gracefulShutdown(server)
