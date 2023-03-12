import { HttpMethod, route } from '@spksoft/koa-decorator'
import createParcel from '../../../domains/parcel/create'
import listParcel from '../../../domains/parcel/list'
import getParcel from '../../../domains/parcel/view'
import deleteParcel from '../../../domains/parcel/delete'
import updateParcel from '../../../domains/parcel/update'

@route('/v1/parcels')
class Parcels {
  @route('/', HttpMethod.POST)
  async createParcel(ctx) {
    const { body, header, query } = ctx.request
    const resp = await createParcel(body, header.customercode || query.customercode)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listParcel(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listParcel(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:parcelId', HttpMethod.GET)
  async getParcel(ctx) {
    const { parcelId } = ctx.params
    const options = ctx.query
    const resp = await getParcel({ _id: parcelId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:parcelId', HttpMethod.PUT)
  async updateParcel(ctx) {
    const { parcelId } = ctx.params
    const { body } = ctx.request
    const resp = await updateParcel({ _id: parcelId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:parcelId', HttpMethod.DELETE)
  async deleteParcel(ctx) {
    const { parcelId } = ctx.params
    const resp = await deleteParcel({ _id: parcelId })
    ctx.res.ok({ data: resp })
  }
}

export default Parcels
