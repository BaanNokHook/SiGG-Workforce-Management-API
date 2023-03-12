import R from 'ramda'
import trueRydeHttp from '../../services/httpService/trueRyde'
import tripRepo from '../../models/trip.repository'
import { findOneWithOutThrow } from '../../utils/domain'

export default async (ref, type) => {
  let filter
  if (type === 'cancel') {
    filter = {
      _id: ref,
    }
  } else if (type === 'fail') {
    filter = {
      orderId: ref,
    }
  }
  const trip = await findOneWithOutThrow(tripRepo, filter)
  const code = R.pathOr('', ['payment', 'coupon'], trip)
  const userId = R.pathOr('', ['passengers', 0], trip)
  const body = {
    code,
    userId,
  }
  const checkReserveResp = await trueRydeHttp
    .post({
      thing: `voucher/checkReserve`,
      body,
    })
    .catch(err => R.path(['response', 'data'], err))
  const checkReserveVoucherRespStatus = R.pathOr('400', ['data', 'statusCodes'], checkReserveResp)
  if (checkReserveVoucherRespStatus === 200) {
    const reserveId = R.pathOr(null, ['data', 'data', '_id'], checkReserveResp)
    const cancelResp = await trueRydeHttp.request({
      url: `voucher/code/cancel/reservedId/${reserveId}`,
      method: 'DELETE',
    })
    return cancelResp.data
  }
  return false
}
