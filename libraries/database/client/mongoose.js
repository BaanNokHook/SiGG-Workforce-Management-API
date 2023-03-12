// @flow
import mongoose from 'mongoose'
import logger from '../../logger'

type IMongooseConnection = {
  uri: string,
  options: {
    dbName: string,
    user: string,
    pass: string,
  },
}

type MongooseConnectionResponse = {
  host: string,
  port: string,
  name: string,
}

export default ({ uri, ...options }: IMongooseConnection): Promise<MongooseConnectionResponse> =>
  new Promise((resolve, reject) => {
    mongoose.connection
      .on('error', (error) => reject(error))
      .on('close', () => logger.info({ event: 'execute' }, `database connection close.`))
      .once('open', () => resolve(mongoose.connections[0]))
    mongoose.connect(uri, { ...options, useNewUrlParser: true, useUnifiedTopology: true })
  })
