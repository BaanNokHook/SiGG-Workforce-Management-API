import { HttpMethod, route } from '@spksoft/koa-decorator'
import mongoose from 'mongoose'
import { conductorClient } from '../../../libraries/conductor'

@route('/v1/system')
export default class SystemController {
  @route('/health', HttpMethod.GET)
  async health(ctx) {
    if (mongoose.connection.readyState === 0) {
      process.exit(1)
    }
    ctx.body = {
      databaseStatus: mongoose.connection.readyState,
    }
  }

  @route('/conductor/tasks', HttpMethod.GET)
  async taksConductor(ctx) {
    try {
      ctx.body = conductorClient.getTasks()
    } catch (error) {
      ctx.body = {
        status: false,
        error,
      }
    }
  }
}
