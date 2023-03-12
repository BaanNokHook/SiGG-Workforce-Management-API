/* eslint-disable global-require */
import fs from 'fs'
import ConductorClient from '@sendit-th/conductor-client'
import logger from '../logger'

export const conductorClient = new ConductorClient({
  baseURL: process.env.CONDUCTOR_URL,
})

export default async (dirname) => {
  const TAXI_APP_DIR = `${dirname}/services/conductor/v1/taxi`
  const DELIVERY_APP_DIR = `${dirname}/services/conductor/v1/delivery`
  try {
    const taxiReceiversPath = fs.readdirSync(TAXI_APP_DIR)
    taxiReceiversPath.forEach(async (file) => {
      if (!file.match(/.receiver.js.map/g)) {
        const PATH = `${TAXI_APP_DIR}/${file}`
        const watcher = require(PATH)
        await watcher.default()
        logger.info({ event: `initial workers` }, { file: `${file}` })
      }
    })
    const deliveryReceiversPath = fs.readdirSync(DELIVERY_APP_DIR)
    deliveryReceiversPath.forEach(async (file) => {
      if (!file.match(/.receiver.js.map/g)) {
        const PATH = `${DELIVERY_APP_DIR}/${file}`
        const watcher = require(PATH)
        await watcher.default()
        logger.info({ event: `initial workers` }, { file: `${file}` })
      }
    })
    logger.info(
      { event: `initial conductor delivery tasks` },
      { count: `${deliveryReceiversPath.length}` },
    )
  } catch (error) {
    logger.error(error, { event: 'initial conductor tasks' })
  }
}
