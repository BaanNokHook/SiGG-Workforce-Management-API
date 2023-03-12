// @flow
import R from 'ramda'
import { generateShortUUID } from './shortId'
import config from '../config/index'
import { type Task } from '../models/implementations/taskRepo'

export function isUseCreditWallet(tripMetadata: any) {
  const isUseCreditWallet = R.path(['config', 'wallet', 'isCreditWallet'], tripMetadata)
  return Boolean(isUseCreditWallet)
}

export function getLogisticWalletId(consumerName: string) {
  if (consumerName === 'Lotus') {
    const sendItId = R.path(['weomni', 'wallet', 'sendit', 'id'], config)
    return sendItId && Number(sendItId)
  }

  return null
}

export function getConsumerWalletId(tripMetadata: any) {
  const consumerWalletId = R.path(['config', 'wallet', 'consumerId'], tripMetadata)
  return consumerWalletId && Number(consumerWalletId)
}

export function getWithdrawalTxRef(orderId: any) {
  return `${orderId}-${generateShortUUID()}`
}

export function getPaymentAmountByTaskId(tasks: Task[]) {
  const paymentPrice = tasks
    .map((task) => {
      const parcels = task.information && task.information.parcels
      if (parcels) return parcels.find((parcel) => parcel.type === 'PAYMENT')
    })
    .filter((tasks) => {
      if (tasks) return tasks
    })

  return Math.abs(R.path(['0', 'price'], paymentPrice))
}

export function buildTags(consumerName?: string, storeName?: string) {
  const tags = []

  if (consumerName) {
    tags.push(consumerName)
  }

  if (storeName) {
    tags.push(storeName)
  }

  return tags
}
