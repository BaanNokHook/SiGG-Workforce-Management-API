import { HttpMethod, route } from '@spksoft/koa-decorator'
import createExtensionFlow from '../../../domains/customer/createExtensionsFlow'
import viewExtensionFlow from '../../../domains/customer/viewExtensionFlow'
import deleteExtensionFlow from '../../../domains/customer/deleteExtensionFlow'
import listExtensionFlow from '../../../domains/customer/listExtensionFlow'
import updateExtensionsFlow from '../../../domains/customer/updateExtensionFlow'

@route('/v1/extensionsflow')
class ExtensionsFlow {
  @route('/', HttpMethod.GET)
  async listExtensionFlow(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listExtensionFlow(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:extensionId', HttpMethod.GET)
  async getCustomer(ctx) {
    const { extensionId } = ctx.params
    const options = ctx.query
    const resp = await viewExtensionFlow({ _id: extensionId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.POST)
  async createExtensionsFlow(ctx) {
    const { body } = ctx.request
    const resp = await createExtensionFlow(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:extensionId', HttpMethod.PUT)
  async updateExtensionsFlow(ctx) {
    const { extensionId } = ctx.params
    const { body } = ctx.request
    const resp = await updateExtensionsFlow({ _id: extensionId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:extensionId', HttpMethod.DELETE)
  async deleteExtensionFlow(ctx) {
    const { extensionId } = ctx.params
    const resp = await deleteExtensionFlow({ _id: extensionId })
    ctx.res.ok({ data: resp })
  }
}

export default ExtensionsFlow
