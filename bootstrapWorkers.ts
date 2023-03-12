import 'babel-polyfill'
import path from 'path'
import 'reflect-metadata'
import uuidV4 from 'uuid/v4'
import useGlobalLogger from './bootstrap/useGlobalLogger'
import './bootstrapHealthcheck'
import './bootstrapMongo'
import config from './config'
import logger from './libraries/logger'
import { ensureConfigKeys } from './utils/configUtil'
import { bootstrapWorkers } from './workers'
import './models/geography.repository'
import { MelonadeWorker } from './workers/melonade/worker'
import { MelonadeConfig } from './config/melonade'

useGlobalLogger(logger)

const hostname = process.env.HOSTNAME || `${process.env.APP_NAME}-${uuidV4()}`

const isLocal = config.env === 'local'

logger.info({ event: 'bootstrap_workers_start' }, { hostname, isLocal })

if (!isLocal && config.database && process.env.NODE_ENV !== 'test') {
  //********** melonade workers *******
  //********************************
  const melonadeWorkerPath = [
    path.resolve(`${__dirname}/workers/melonade/*.worker.js`),
    path.resolve(`${__dirname}/workers/melonade/wfm/*.worker.js`),
  ]
  ensureConfigKeys(MelonadeConfig, 'kafkaServers', 'namespace')
  const melonadeWorker = new MelonadeWorker(melonadeWorkerPath, {
    servers: MelonadeConfig.kafkaServers || '',
    namespace: MelonadeConfig.namespace || '',
  })
  melonadeWorker.initial()

  //********** kafka workers *******
  //********************************
  bootstrapWorkers()
}
