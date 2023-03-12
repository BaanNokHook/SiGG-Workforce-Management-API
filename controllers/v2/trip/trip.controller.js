import { HttpMethod, route } from '@spksoft/koa-decorator'
import { tripDomain } from '../../../domains/trip'

@route('/v2/trips')
class Trip {
  @route('/', HttpMethod.POST)
  async createTrip(ctx) {
    const { body } = ctx.request
    const resp = await tripDomain.create(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId', HttpMethod.DELETE)
  async deleteTrip(ctx) {
    const { tripId } = ctx.params
    const resp = await tripDomain.delete(tripId)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/cancel', HttpMethod.POST)
  async cancelTrip(ctx) {
    const { body } = ctx.request
    const { tripId } = ctx.params
    const resp = await tripDomain.cancel({ ...body, tripId })
    ctx.res.ok({ data: resp })
  }
}

export default Trip
