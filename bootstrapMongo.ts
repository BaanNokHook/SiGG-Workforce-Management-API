import 'dotenv/config'
import { ensureConfigKeys } from './utils/configUtil'
import config from './config'
import mongooseClient from './libraries/database/client/mongoose'
import logger from './libraries/logger'

ensureConfigKeys(config.database, 'uri', 'dbName', 'user', 'pass')

const mongooseOptions = {
  uri: config.database.uri,
  dbName: config.database.dbName,
  user: config.database.user,
  pass: config.database.pass,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}

try {
  mongooseClient(mongooseOptions as any).then((dbClient) => {
    logger.info(
      { event: 'bootstrap_mongo' },
      `Connected to ${dbClient.host}:${dbClient.port}/${dbClient.name}`,
    )
  })
} catch (error) {
  logger.error({ event: 'bootstrap_mongo_error', err: error })
  process.exit(-1)
}
