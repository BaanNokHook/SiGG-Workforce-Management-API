import { HttpMethod, route } from '@spksoft/koa-decorator'
import getMetaData from '../../../domains/metaData/view'
import listMetaData from '../../../domains/metaData/list'

@route('/v1/metadatas')
class MetaDatas {
  @route('/', HttpMethod.GET)
  async getMetaData(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listMetaData(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:metadataId', HttpMethod.GET)
  async listMetaData(ctx) {
    const { metadataId } = ctx.params
    const options = ctx.query
    const resp = await getMetaData({ _id: metadataId }, options)
    ctx.res.ok({ data: resp })
  }
}

export default MetaDatas
