import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP, injectJaeger } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import tripRepository from '../../../../models/trip.repository'
import { checkUpdate, findOneWithOutThrow } from '../../../../utils/domain'
import fleetHttp from '../../../httpService/fleet'
import trueRydeHttp from '../../../httpService/trueRyde'
import orderHttp from '../../../httpService/order'
import graylog from '../../../../utils/graylog.util'

const TASK_NAME = 'TRD_TMS_SUMMARY'

const cancelVoucher = async reservedId => {
  const resp = await trueRydeHttp
    .deleteOne({
      thing: `voucher/code/cancel/reservedId/${reservedId}`,
    })
    .catch(err => R.path(['response', 'data'], err))
  console.log('cancelVoucher resp', resp)
  return resp.data
}

const getPassengerIdByOder = async orderId => {
  const filter = {
    orderId,
  }
  console.log('getPassengerIdByOder start', orderId)
  const resp = await findOneWithOutThrow(tripRepository, filter)
  console.log('getPassengerIdByOder end', resp)
  return R.pathOr(null, ['passengers', 0], resp)
}

const applyByReserveUid = async reserveUid => {
  const body = {
    reserveUid,
  }
  const resp = await trueRydeHttp
    .post({
      thing: `voucher/applyByReserveUid`,
      body,
    })
    .catch(err => R.path(['response', 'data'], err))
  return resp.data
}

const checkReserveVoucher = async (code, userId) => {
  const body = {
    code,
    userId,
  }
  const resp = await trueRydeHttp
    .post({
      thing: `voucher/checkReserve`,
      body,
    })
    .catch(err => R.path(['response', 'data'], err))
  return resp.data
}

// eslint-disable-next-line consistent-return
const usedVoucher = async data => {
  const orderId = R.pathOr(null, ['orderId'], data)
  const code = R.pathOr(null, ['payment', 'coupon'], data)
  const discount = R.pathOr(null, ['payment', 'detailService', 'discount'], data)
  console.log('usedVoucher', code, orderId, discount)
  const passengerUserId = await getPassengerIdByOder(orderId)
  console.log('passengerUserId', passengerUserId)
  const checkReserveVoucherResp = await checkReserveVoucher(code, passengerUserId)
  console.log('checkReserveVoucherResp', checkReserveVoucherResp)
  const checkReserveVoucherRespStatus = R.pathOr('400', ['statusCodes'], checkReserveVoucherResp)
  console.log('checkReserveVoucherRespStatus', checkReserveVoucherRespStatus)
  if (checkReserveVoucherRespStatus === 200) {
    const reserveId = R.pathOr(null, ['data', '_id'], checkReserveVoucherResp)
    console.log('reserveId', reserveId)
    if (discount != 0) {
      console.log('applyVoucherResp start', reserveId)
      const applyVoucherResp = await applyByReserveUid(reserveId)
      console.log('applyVoucherResp end', applyVoucherResp)
      return applyVoucherResp
    }
    console.log('cancelVoucher passengerUserId', reserveId)
    const cancelVoucherResp = await cancelVoucher(reserveId)
    console.log('cancelVoucherResp', cancelVoucherResp)
    return cancelVoucherResp
  }
}

const getPaymentOrderDetail = async orderId => {
  try {
    const resp = await orderHttp.get({
      thing: 'v1/order',
      findBy: orderId,
    })

    console.log('get order detail resp:', resp)

    const orderDetail = R.path(['data', 'data'], resp)
    const payment = R.path(['workflowInput', 'order', 'metadata', 'payment'], orderDetail)

    return payment
  } catch (error) {
    console.log('get payment order detail error:', error)
    return {}
  }
}

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      console.log(`${TASK_NAME} start`)
      const carrier = { 'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data) }
      const childSpan = startJaegerSpan(`${TASK_NAME}`, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
      })

      injectJaeger(childSpan, FORMAT_TEXT_MAP, carrier)
      const getData = R.pick(['taskId', 'inputData', 'workflowInstanceId', 'workflowType'], data)
      console.log('TCL: getData', getData)
      childSpan.setTag('orderId', R.path(['inputData', 'orderId'], getData))
      childSpan.setTag('tripId', R.path(['inputData', 'tripId'], getData))
      childSpan.log({
        inputData: data.inputData,
      })
      const _graylog = graylog('SERVICE', 'CONDUCTOR', TASK_NAME, [
        { name: 'orderId', value: R.path(['inputData', 'orderId'], data), logInMessage: true },
        { name: 'taskName', value: TASK_NAME },
        { name: 'taskId', value: R.path(['taskId'], data) },
        { name: 'workflowInstanceId', value: R.path(['workflowInstanceId'], data) },
      ])

      _graylog.info('START')
      try {
        const tripUpdate = await checkUpdate(
          tripRepository,
          { _id: R.path(['tripId'], getData.inputData) },
          {
            workflowInstanceId: R.path(['workflowInstanceId'], getData),
            workflowType: R.path(['workflowType'], getData),
            workflowTaskId: R.path(['taskId'], getData),
          },
        )

        console.log('get payment order from oms')
        const paymentOrderDetail = await getPaymentOrderDetail(
          R.path(['inputData', 'orderId'], data),
        )

        _graylog.info('INFO.TRIP_UPDATED', { tripUpdate })
        const bodyRequestUpdate = {
          method: R.path(['payment', 'method'], tripUpdate),
          ...R.pick(['serviceFee', 'driverIncome'], paymentOrderDetail),
        }

        console.log('TCL: bodyRequestUpdate', bodyRequestUpdate)
        const priceFleetUpdate = await fleetHttp.put({
          thing: `workSchedules/update-payment`,
          id: tripUpdate._id,
          body: bodyRequestUpdate,
          headers: {},
        })

        _graylog.info('INFO.UPDATED_PRICE_TO_FLEET', { priceFleetUpdate })
        childSpan.setTag('updatePriceToFleet', true)
        console.log(`UPDATE PRICE TO FLEET ****`)
        const outputData = {
          ...R.pathOr({}, ['inputData'], getData),
          ...paymentOrderDetail,
          statuses: [
            ...R.pathOr({}, ['inputData', 'statuses'], getData),
            { status: 'COMPLETE_TRIP', updatedAt: Date.now() },
          ],
          'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
        }

        const usedVoucherResp = await usedVoucher(outputData).catch(err =>
          R.path(['response', 'data'], err),
        )
        console.log(`UsedVoucher result: `, usedVoucherResp)

        await updater.complete({ outputData })
        console.log(`${TASK_NAME} complete`)
        childSpan.log({ outputData })
        childSpan.finish()
        _graylog.info('COMPLETE.COMPLETE_TRIP')
      } catch (error) {
        _graylog.error('ERROR.COMPLETE_TRIP_FAILED', null, error)
        childSpan.log({ error })
        childSpan.setTag('error', true)
        console.log(`${TASK_NAME}: error`, error)
        await updater.fail({
          taskId: data.taskId,
          outputData: {
            ...R.pathOr({}, ['inputData'], getData),
            statuses: [
              ...R.path(['inputData', 'statuses'], data),
              { status: 'COMPLETE_TRIP_FAILED', updatedAt: Date.now() },
            ],
            'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
            error: JSON.stringify(error, null, 2),
          },
        })
        childSpan.finish()
      }
    },
    { pollingIntervals: 100, autoAck: true, maxRunner: 5 },
    true,
  )
}
