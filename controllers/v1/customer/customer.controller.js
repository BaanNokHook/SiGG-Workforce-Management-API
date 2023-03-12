import { HttpMethod, route } from '@spksoft/koa-decorator'
import createCustomer from '../../../domains/customer/create'
import listCustomer from '../../../domains/customer/list'
import deleteCustomer from '../../../domains/customer/delete'
import updateCustomer from '../../../domains/customer/update'
import getCustomer from '../../../domains/customer/view'

@route('/v1/customers')
class Customers {
  @route('/', HttpMethod.POST)
  async createCusomter(ctx) {
    const { body } = ctx.request
    const resp = await createCustomer(body)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listCustomer(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listCustomer(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:custId', HttpMethod.GET)
  async getCustomer(ctx) {
    const { custId } = ctx.params
    const options = ctx.query
    const resp = await getCustomer({ _id: custId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:custId', HttpMethod.PUT)
  async updateCustomer(ctx) {
    const { custId } = ctx.params
    const { body } = ctx.request
    const resp = await updateCustomer({ _id: custId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:custId', HttpMethod.DELETE)
  async deleteCustomer(ctx) {
    const { custId } = ctx.params
    const resp = await deleteCustomer({ _id: custId })
    ctx.res.ok({ data: resp })
  }
}

export default Customers
