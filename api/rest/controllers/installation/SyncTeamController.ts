import { IRouterContext } from 'koa-router';
import { Body, Controller, Ctx, Post, UseBefore } from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { SyncTeamDomain } from '../../../../domains/installation/syncTeam.domain';
import { CreateTeamRequestDto } from './SyncTeam.dto';

@Controller('/v1/installation')
@UseBefore(enableTracing)
export class SyncStaffController {
  constructor(private syncTeamDomain: SyncTeamDomain) {}

  @Post('/teams')
  public updateStaffInfo(
    @Ctx() ctx: IRouterContext,
    @Body() request: CreateTeamRequestDto,
  ) {
    ctx.status = 200;
    return this.syncTeamDomain.buildTeam(request);
  }
}
