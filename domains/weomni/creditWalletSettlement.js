//@flow
import R from 'ramda'
import { type IWeomniWallet } from './wallet'
import { fleetApiService, IFleetApiService } from '../../adapters/restClient/fleet'
import { type ITodoRepo, type Todo } from '../../models/implementations/todoRepo'
import { getLogisticWalletId, getConsumerWalletId, buildTags } from '../../utils/weomni.util'
import logger from '../../libraries/logger'
import responseTime from '../../libraries/logger/responseTime'
import { ValidateError, NotFound, CreditWalletFailed } from '../../constants/error'
import { validateData } from '../../utils/validate'
import { getCurrentDateTime } from '../../utils/date.util'
import { type Trip } from '../../models/implementations/tripRepo'
import { roundedDecimals } from '../../utils/domain'

const STAFF_TYPE = {
  PART_TIME_EMPLOYEE: 'part_time_employee',
  WEEKLY_CONTRACT: 'weekly_contract',
  FULL_TIME_EMPLOYEE: 'full_time_employee',
}

export class CreditWalletSettlementDomain {
  WeomniWallet: IWeomniWallet
  TodoRepository: ITodoRepo
  FleetApiService: IFleetApiService

  constructor(
    WeomniWallet: IWeomniWallet,
    TodoRepository: ITodoRepo,
    FleetApiService: IFleetApiService,
  ) {
    this.WeomniWallet = WeomniWallet
    this.TodoRepository = TodoRepository
    this.FleetApiService = FleetApiService
  }

  async capture(txRef: string, holdTxRef: string, amount: number, options: Object = {}) {
    const logMetadata = {
      event: 'credit_wallet_settlement_capture',
      txRef,
      holdTxRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      validateData({
        schema: {
          properties: {
            txRef: { type: 'string' },
            holdTxRef: { type: 'string' },
            amount: { type: 'number' },
          },
          required: ['txRef', 'holdTxRef', 'amount'],
        },
        data: { txRef, holdTxRef, amount },
      })

      const request = {
        txRef,
        amount: roundedDecimals(amount, 2),
        holdTxRef,
        ...options,
      }
      const response = await this.WeomniWallet.capture(request)
      const capturedAt = getCurrentDateTime()
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response, capturedAt }))

      return { ...response, capturedAt }
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })

      if (err instanceof ValidateError) {
        throw err
      }

      throw new CreditWalletFailed(null, null, 'creditWallet.error.accept.cannotCapture')
    }
  }

  async withdrawal(request: Object) {
    const logMetadata = {
      event: 'credit_wallet_settlement_withdrawal',
      txRefs: request.txRef,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      validateData({
        schema: {
          type: 'object',
          properties: {
            txRef: { type: 'string' },
            from: { type: 'number' },
            to: { type: 'number' },
            amount: { type: 'number' },
            note: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['txRef', 'amount', 'from', 'to'],
        },
        data: request,
      })

      const response = await this.WeomniWallet.withdrawal(request)
      const withdrawalAt = getCurrentDateTime()
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response, withdrawalAt }))

      return { ...response, withdrawalAt }
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })

      if (err instanceof ValidateError) {
        throw err
      }

      throw new CreditWalletFailed(null, null, 'creditWallet.error.accept.cannotSettlement')
    }
  }

  async settlement(userId: string, todo: Todo) {
    const { _id: todoId, result } = todo
    const { capturedAt = '', withdrawalAt = '' } = result || {}
    let response = {
      ...result,
      capturedAt,
      withdrawalAt,
      userId,
    }
    const logMetadata = {
      event: 'credit_wallet_settlement',
      userId,
      todoId,
      logResponseTimeStart: new Date().getTime(),
    }

    const trip = todo.taskId.tripId
    const { metadata = {}, payment = {} } = trip
    const { consumerName, storeName, weomniTxRef: holdTxRef } = metadata

    try {
      if (!holdTxRef) throw new ValidateError('txRef is required')

      if (capturedAt && withdrawalAt) return response

      if (!capturedAt) {
        const { extraCODAmount = 0 } = payment
        const captured = await this.capture(`${holdTxRef}-capture`, holdTxRef, extraCODAmount, {
          tags: buildTags(consumerName, storeName),
        })
        response.capturedAt = captured.capturedAt
        await this.TodoRepository.updateById(todoId, { result: response })
      }

      if (!withdrawalAt) {
        const withdrawalInput = await this.buildWithdrawalInput(trip, userId)

        if (withdrawalInput) {
          const withdrawed = await this.withdrawal(withdrawalInput)
          response.withdrawalAt = withdrawed.withdrawalAt
          await this.TodoRepository.updateById(todoId, { result: response })
        }
      }
      logger.info(responseTime(logMetadata), JSON.stringify({ response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ metadata }))
      throw err
    }
  }

  async buildWithdrawalInput(trip: Trip, userId: string) {
    const logMetadata = {
      event: 'credit_wallet_build_withdrawal_input',
      userId,
      tripId: trip._id,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      let withdrawalInput
      const { metadata = {}, payment = {} } = trip
      const { consumerName, storeName, weomniTxRef: holdTxRef } = metadata
      const consumerWalletId = getConsumerWalletId(metadata)
      const logisticWalletId = getLogisticWalletId(consumerName)
      const { extraCODAmount } = payment

      if (extraCODAmount > 0) {
        withdrawalInput = {
          from: logisticWalletId,
          to: consumerWalletId,
          amount: roundedDecimals(extraCODAmount, 2),
          txRef: `${holdTxRef}-withdrawal-extra-cod-amount`,
          note: 'extra cod amount',
          tags: buildTags(consumerName, storeName),
        }
      }

      logger.info(responseTime(logMetadata), JSON.stringify({ withdrawalInput }))

      return withdrawalInput
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }
}
