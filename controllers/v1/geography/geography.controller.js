import { HttpMethod, route } from '@spksoft/koa-decorator'

import listGeography from '../../../domains/geography/list'
import deleteGeography from '../../../domains/geography/delete'
import createGeography from '../../../domains/geography/create'
import updateGeography from '../../../domains/geography/update'
import getGeography from '../../../domains/geography/view'

@route('/v1/geographies')
class Geographies {
  @route('/', HttpMethod.POST)
  async createGeography(ctx) {
    const { body } = ctx.request
    const resp = await createGeography(body)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listGeography(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listGeography(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:geographyId', HttpMethod.GET)
  async getGeography(ctx) {
    const { geographyId } = ctx.params
    const options = ctx.query
    const resp = await getGeography({ _id: geographyId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:geographyId', HttpMethod.PUT)
  async updateGeography(ctx) {
    const { geographyId } = ctx.params
    const { body } = ctx.request
    const resp = await updateGeography({ _id: geographyId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:geographyId', HttpMethod.DELETE)
  async deleteGeography(ctx) {
    const { geographyId } = ctx.params
    const resp = await deleteGeography({ _id: geographyId })
    ctx.res.ok({ data: resp })
  }
}

export default Geographies
