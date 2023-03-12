import { HttpMethod, route } from '@spksoft/koa-decorator'
import getStaff from '../../../domains/staff/view'
import listStaff from '../../../domains/staff/list'
import listPaymentTransactionHistory from '../../../domains/staff/listPaymentTransactionHistory'

@route('/v1/staffs')
class Staffs {
  @route('/', HttpMethod.GET)
  async listStaff(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listStaff(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:staffId', HttpMethod.GET)
  async getStaff(ctx) {
    const { staffId } = ctx.params
    const options = ctx.query
    const resp = await getStaff({ _id: staffId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/payment-transaction-history/:userId', HttpMethod.GET)
  async listPaymentTransactionHistory(ctx) {
    const { headers } = ctx.request
    const { userId } = ctx.params
    const options = ctx.query
    const resp = await listPaymentTransactionHistory(userId, options, headers)

    ctx.body = {
      status: 'OK',
      statusCode: 200,
      ...resp,
    }
  }
}

export default Staffs
