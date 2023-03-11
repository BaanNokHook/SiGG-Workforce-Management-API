import * as R from 'ramda'
import logger from '../../libraries/logger'
import responseTime from '../../libraries/logger/responseTime'
import { RestClient, IRestClient } from '../../libraries/client/restClient'
import config from '../../config/index'

const { url, clientId, clientSecret, projectId, tokenCode } = config.weomni

export type earnsBulk = {
  orderRef: string,
  channel: string,
  token: {
    TRIP: number,
    DROP: number,
    KM: number,
  },
  username: string,
}

export class WeomniApiService {
  restClient: IRestClient
  constructor(restClient: IRestClient) {
    this.restClient = restClient
  }

  composeBasicAuth() {
    const bufferTxt = `${clientId}:${clientSecret}`

    return `Basic ${Buffer.from(bufferTxt).toString('base64')}`
  }

  async getHeaders() {
    const tokenWeomni = await this.oauth()

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenWeomni}`,
      'accept-encoding': 'gzip',
    }
  }

  async oauth() {
    const auth = this.composeBasicAuth()
    const params = new URLSearchParams()
    params.append('grant_type', 'client_credentials')

    const request = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: auth,
        'accept-encoding': 'gzip',
      },
      params,
    }

    const logMetadata = {
      event: 'weomni_oauth',
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post('/uaa/oauth/token', request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return R.path(['access_token'], response)
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }

  async searchWallet(userId: string) {
    const logMetadata = {
      event: 'weomni_search_wallet',
      userId,
      logResponseTimeStart: new Date().getTime(),
    }

    const request = {
      headers: await this.getHeaders(),
    }

    try {
      const response = await this.restClient.get(
        `/wallet/api/projects/${projectId}/t/${tokenCode}/wallets?username.equals=${userId}`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async withdrawal(rawBody) {
    const request = {
      data: rawBody,
      headers: await this.getHeaders(),
    }
    const txRef = R.path(['txRef'], rawBody)

    const logMetadata = {
      event: 'weomni_credit_withdrawal',
      txRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post(
        `/wallet/api/projects/${projectId}/t/${tokenCode}/withdrawal`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }

  async release(rawBody) {
    const request = {
      data: rawBody,
      headers: await this.getHeaders(),
    }

    const txRef = R.path(['txRef'], rawBody)

    const logMetadata = {
      event: 'weomni_credit_release',
      txRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post(
        `/wallet/api/projects/${projectId}/t/${tokenCode}/release`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }

  async capture(rawBody) {
    const request = {
      data: rawBody,
      headers: await this.getHeaders(),
    }

    const txRef = R.path(['txRef'], rawBody)

    const logMetadata = {
      event: 'weomni_credit_capture',
      txRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post(
        `/wallet/api/projects/${projectId}/t/${tokenCode}/capture`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }

  async withdrawalBulk(rawBody) {
    const request = {
      data: rawBody,
      headers: await this.getHeaders(),
    }

    const logMetadata = {
      event: 'weomni_credit_withdrawal_bulk',
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post(
        `/wallet/api/projects/${projectId}/t/${tokenCode}/withdrawal-bulk`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }

  async earnsBulk(rawBody: earnsBulk[]) {
    const { username } = rawBody
    const request = {
      data: rawBody,
      headers: await this.getHeaders(),
    }

    const logMetadata = {
      event: 'weomni_crm_earns_bulk',
      username,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.restClient.post(
        `/crm/api/projects/${projectId}/earns-bulk`,
        request,
      )
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }
}

export const weomniApiService = new WeomniApiService(new RestClient({ baseURL: url, headers: {} }))
