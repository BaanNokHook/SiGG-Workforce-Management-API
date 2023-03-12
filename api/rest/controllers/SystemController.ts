import { IRouterContext } from 'koa-router';
import { Controller, Ctx, Get } from 'routing-controllers';
import { Healthchecker } from '../../../libraries/health/healthchecker';

@Controller('/system')
export class HealthController {
  constructor(private healtchecker: Healthchecker) {}

  @Get('/health')
  async health(@Ctx() ctx: IRouterContext) {
    const result = await this.healtchecker.check();

    if (!result.ok) {
      ctx.status = 503;
      ctx.message = 'Unhealthy';
    }

    return result;
  }
}
