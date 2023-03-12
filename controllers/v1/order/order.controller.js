import { HttpMethod, route } from '@spksoft/koa-decorator'
import Extension from '../../../domains/extension'
import cancelWorkflow from '../../../domains/conductor/cancelWorkflow'
import startWorkflow from '../../../domains/conductor/startWorkflow'
import getTaskStatus from '../../../domains/task/getTaskStatus'

@route('/v1/orders')
class Orders {
  @route('/', HttpMethod.POST)
  async createOrder(ctx) {
    const { body } = ctx.request
    const tasks = await Extension(body)
    ctx.res.ok({ data: tasks })
  }

  @route('/conductor/cancel', HttpMethod.POST)
  async cancelWorkflow(ctx) {
    const { body } = ctx.request
    const resp = await cancelWorkflow(body)
    ctx.res.ok({ data: resp })
  }

  @route('/conductor', HttpMethod.POST)
  async createOrderConductor(ctx) {
    const { body } = ctx.request
    const resp = await startWorkflow(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:orderId/status', HttpMethod.GET)
  async getTaskStatus(ctx) {
    const { orderId } = ctx.params
    const resp = await getTaskStatus(orderId)
    ctx.res.ok({ data: resp })
  }
}

export default Orders
