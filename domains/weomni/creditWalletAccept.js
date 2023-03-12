// @flow
import R from 'ramda'
import { type IWeomniWallet } from './wallet'
import updateTripMetadata from '../trip/updateMetadata'
import { type Trip } from '../../models/implementations/tripRepo'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'
import {
  getLogisticWalletId,
  getWithdrawalTxRef,
  getPaymentAmountByTaskId,
  buildTags,
} from '../../utils/weomni.util'
import { ValidateError, NotFound, CreditWalletFailed } from '../../constants/error'
import { fleetApiService, IFleetApiService } from '../../adapters/restClient/fleet'
import { roundedDecimals } from '../../utils/domain'

export interface ICreditWalletAcceptDomain {
  getWalletId(userId: string): Promise<number>;
  holdWithdrawal(userId: string): Promise<any>;
  releaseHoldWithdrawal(userId: string, tripId: string, weomniTxRef: string): Promise<any>;
  deleteStaffInsufficientfundFromStaffOrderTicket(staffId: string, orderTicket: string): Promise<any>;
}

export class CreditWalletAcceptDomain {
  WeomniWallet: IWeomniWallet
  FleetApiService: IFleetApiService

  constructor(WeomniWallet: IWeomniWallet, FleetApiService: IFleetApiService) {
    this.WeomniWallet = WeomniWallet
    this.FleetApiService = FleetApiService
  }

  async getWalletId(userId: string) {
    const logMetadata = {
      event: 'credit_wallet_accept_get_wallet_id',
      userId,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      if (!userId) throw new ValidateError('userId is required')

      const response = await this.WeomniWallet.searchWallet(userId)
      const walletId = R.path(['0', 'id'], response)

      if (!walletId) {
        throw new NotFound(`wallet id by user id ${userId} not found on Weomni`)
      }
      logger.info(responseTime(logMetadata), JSON.stringify({ response }))

      return walletId
    } catch (error) {
      logger.error({ error, ...responseTime(logMetadata) })
      throw error
    }
  }

  async holdWithdrawal(userId: string, trip: Trip) {
    let withdrawal
    const { _id: tripId, metadata, tasks } = trip
    const logMetadata = {
      event: 'credit_wallet_accept_hold_withdrawal',
      userId,
      tripId,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const { consumerName, orderId, config, storeName } = metadata || {}
      const holdWallet = R.pathOr(0, ['payment', 'detailService', 'driver', 'holdWallet'], trip)
      const walletId = await this.getWalletId(userId)
      const txRef = getWithdrawalTxRef(orderId)

      const rawBody = {
        mode: 'HOLD',
        from: walletId,
        to: getLogisticWalletId(consumerName),
        amount: roundedDecimals(holdWallet, 2),
        txRef,
        tags: buildTags(consumerName, storeName),
      }

      withdrawal = await this.WeomniWallet.withdrawal(rawBody)
      await updateTripMetadata(tripId, { ...metadata, weomniTxRef: txRef })

      logger.info(responseTime(logMetadata), JSON.stringify({ rawBody, withdrawal }))
      return withdrawal
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      const errorCode = 'CANNOT_HOLD_CREDIT_WALLET'

      if (withdrawal) {
        const weomniTxRef = R.path(['txRef'], withdrawal)
        await this.releaseHoldWithdrawal(userId, tripId, weomniTxRef)
      }

      const errTitle = R.path(['data', 'title'], err)

      if (errTitle && errTitle.toUpperCase() === 'INSUFFICIENTFUND') {
        const { _id: staffId } = await this.FleetApiService.getStaff(userId)
        const ticketId = R.path(['dispatch', 'fleet', 'ticketId'], metadata)
        await this.deleteStaffInsufficientfundFromStaffOrderTicket(staffId, ticketId)
        throw new CreditWalletFailed(null, null, 'creditWallet.error.accept.insufficientFund')
      }

      throw new CreditWalletFailed(null, null, 'creditWallet.error.accept.cannotHoldWallet')
    }
  }

  async releaseHoldWithdrawal(userId: string, tripId: string, weomniTxRef: string) {
    const request = {
      txRef: `${weomniTxRef}-release`,
      holdTxRef: `${weomniTxRef}`,
    }

    const logMetadata = {
      event: 'credit_wallet_accept_release_hold_withdrawal',
      userId,
      tripId,
      txRef: request.txRef,
      holdTxRef: request.holdTxRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await this.WeomniWallet.release(request)

      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))
      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })

      throw err
    }
  }

  async deleteStaffInsufficientfundFromStaffOrderTicket(staffId: string, orderTicket: string) {
    const logMetadata = {
      event: 'credit_wallet_accept_hold_withdrawal_delete_staff_insufficientfund',
      staffId,
      orderTicket,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      if (!orderTicket) throw new ValidateError('orderTicket is required')
      if (!staffId) throw new ValidateError('staffId is required')

      const response = await this.FleetApiService.deleteStaffFromStaffOrderTicket(
        staffId,
        orderTicket,
      )

      logger.info(responseTime(logMetadata), JSON.stringify({ response }))
      return response
    } catch (error) {
      logger.error({ error, ...responseTime(logMetadata) })
      throw error
    }
  }
}
