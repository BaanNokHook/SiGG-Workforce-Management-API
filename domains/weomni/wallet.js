// @flow
import logger from '../../libraries/logger'
import responseTime from '../../libraries/logger/responseTime'
import { ValidateError } from '../../constants/error'
import { weomniApiService } from '../../adapters/restClient/weomni'

export interface IWeomniWallet {
  searchWallet(userId: string): Promise<any>;
  withdrawal(request: any): Promise<any>;
  release(request: any): Promise<any>;
  capture(request: any): Promise<any>;
  withdrawalBulk(request: Object[]): Promise<any>;
}

export class WeomniWallet {
  async searchWallet(userId: string): Promise<any> {
    const logMetadata = {
      event: 'weomni_search_wallet_wallet',
      userId,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      if (!userId) throw new ValidateError('userId is required')

      const response = await weomniApiService.searchWallet(userId)
      logger.info(responseTime(logMetadata), JSON.stringify({ response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async withdrawal(request: any): Promise<any> {
    const logMetadata = {
      event: 'weomni_withdrawal_wallet',
      txRef: request.txRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await weomniApiService.withdrawal(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }

  async release(request: any): Promise<any> {
    const logMetadata = {
      event: 'weomni_release_wallet',
      txRef: request.txRef,
      holdTxRef: request.holdTxRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await weomniApiService.release(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }

  async capture(request: any): Promise<any> {
    const logMetadata = {
      event: 'weomni_capture_wallet',
      txRef: request.txRef,
      holdTxRef: request.holdTxRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await weomniApiService.capture(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }

  async withdrawalBulk(request: Object[]): Promise<any> {
    const logMetadata = {
      event: 'weomni_withdrawal_bulk_wallet',
      txRefs: request.map((input) => input.txRef),
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await weomniApiService.withdrawalBulk(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }
}
