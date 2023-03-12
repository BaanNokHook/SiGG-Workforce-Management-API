// @flow
import R from 'ramda'

import TripRepository from '../../models/trip.repository'
import TaskRepository from '../../models/task.repository'
import ThrowError from '../../error/basic'
import paymentHttpService from '../../services/httpService/payment'
import fleetHttpService from '../../services/httpService/fleet'
import { roundedDecimals } from '../../utils/domain'

type Options = {
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}

const POPULATE_GEOGRAPHY = {
  populate: [{ path: 'geographyId' }],
}

const calculateAmount = ({ serviceFee, discount, fare, expressWayFare }) =>
  Math.abs(fare + expressWayFare - discount) + serviceFee

const findStartAddress = async tasks => {
  const taskResp = await TaskRepository.findOne(
    {
      _id: { $in: tasks },
      deliveryStatus: 'PICK_UP',
    },
    POPULATE_GEOGRAPHY,
  )

  const startAddress = R.pathOr('', ['geographyId', 'address', 'address'], taskResp)
  return startAddress
}

const findDestinationAddress = async tasks => {
  const taskResp = await TaskRepository.findOne(
    {
      _id: { $in: tasks },
      deliveryStatus: 'DELIVER',
    },
    POPULATE_GEOGRAPHY,
  )

  const destinationAddress = R.pathOr('', ['geographyId', 'address', 'address'], taskResp)
  return destinationAddress
}

const fulfillFarePaymentHistory = async trip => {
  const payment = R.path(['payment'], trip)

  const startAddress = await findStartAddress(trip.tasks)
  const destinationAddress = await findDestinationAddress(trip.tasks)

  const composeAddress = `${startAddress} - ${destinationAddress}`

  const amount = calculateAmount(payment.detailService)

  return {
    transactionType: 'ค่าเดินทาง',
    paymentMethod: payment.method,
    message: composeAddress,
    transactionDate: trip.updatedAt,
    amount,
    truepoint: 0,
    truepointStatus: false,
  }
}

const getTmnTransactions = async (tmnPhone, options, headers) => {
  const token = headers.authorization
  const { page, limit } = options
  const params = {
    filter: { merchantMobileNumber: tmnPhone },
    limit,
    page,
  }
  const tmnTransactions = await paymentHttpService.request({
    method: 'GET',
    url: `v1/payment/transaction/tmn`,
    params,
    headers: {
      Authorization: token,
    },
  })
  const transactions = R.pathOr([], ['data', 'data'], tmnTransactions).map((trx) => {
    return {
      transactionType: 'ค่าเดินทาง',
      paymentMethod: 'truemoney',
      message: 'รับเงินจาก truemoney wallet',
      transactionDate: trx.createdAt,
      amount: trx.moneyAmount / 100,
      truepoint: 0,
      truepointStatus: false,
    }
  })
  return transactions
}

const fulfillPromotionPaymentHistory = async trip => {
  let resultAmountTrueMoneyRewardLog = null

  const tripId = R.path(['tripId'], trip)
  const payment = R.path(['payment'], trip)

  if (tripId) {
    // load true money reward log from tripId for find amount
    const trueMoneyRewardLogResp = await paymentHttpService
      .get({
        thing: 'v1/payment/true-money-reward-log',
        findBy: tripId,
      })
      .catch(error => R.path(['response', 'data'], error))

    console.log('get trueMoneyRewardLogResp', trueMoneyRewardLogResp)

    if (trueMoneyRewardLogResp.status === 200) {
      resultAmountTrueMoneyRewardLog = R.path(['data', 'data', 'amount'], trueMoneyRewardLogResp)
    }
  }

  // data from true such as money 5000 equal 50
  const amountTrueMoney = resultAmountTrueMoneyRewardLog / 100

  const amount = roundedDecimals(amountTrueMoney, 2)

  let promotionPaymentHistory = null

  if (amount) {
    promotionPaymentHistory = {
      transactionType: 'โปรโมชั่น',
      paymentMethod: payment.method,
      message: tripId,
      transactionDate: trip.updatedAt,
      amount,
      truepoint: 0,
      truepointStatus: false,
    }
  }
  return promotionPaymentHistory
}

const findStaffFromFleet = async userId => {
  let staffId
  try {
    const fleetStaffResp = await fleetHttpService.get({
      thing: 'staff',
      findBy: userId,
    })
    staffId = R.pathOr('', ['data', 'data', '_id'], fleetStaffResp)
    return staffId
  } catch (error) {
    throw ThrowError.NOT_FOUND('staff not found')
  }
}

export default async (userId: string, options: Options, headers: any) => {
  const staffId = await findStaffFromFleet(userId)

  const { page = 1, limit = 5, tmnPhone } = options

  const trips = await TripRepository.find(
    {
      extensionType: 'TAXI',
      staffs: staffId,
      status: 'DONE',
    },
    {
      ...options,
      page,
      limit,
    },
  )

  const pickExcludeTripData = R.pick(['total', 'limit', 'page', 'hasNext'], trips)

  const paymentHistories = []

  // eslint-disable-next-line
  for (const trip of R.pathOr([], ['data'], trips)) {
    // eslint-disable-next-line no-await-in-loop
    const resultFarePaymentHistory = await fulfillFarePaymentHistory(trip)
    // eslint-disable-next-line no-await-in-loop
    const resultPromotionPaymentHistory = await fulfillPromotionPaymentHistory(trip)

    if (resultFarePaymentHistory) {
      paymentHistories.push(resultFarePaymentHistory)
    }

    if (resultPromotionPaymentHistory) {
      paymentHistories.push(resultPromotionPaymentHistory)
    }
  }

  const tmnTransactions = await getTmnTransactions(tmnPhone, { page, limit }, headers)
  paymentHistories.push(...tmnTransactions)
  const response = { data: paymentHistories, ...pickExcludeTripData }

  return response
}
