import { IRouterContext } from 'koa-router';
import {
  Body,
  Controller,
  Ctx,
  Param,
  Post,
  UseBefore,
} from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { SyncStaffDomain } from '../../../../domains/installation/syncStaff.domain';
import {
  CreateStaffVacationRequestDto,
  UpdateStaffRequestDto,
} from './SyncStaff.dto';

@Controller('/v1/installation')
@UseBefore(enableTracing)
export class SyncStaffController {
  constructor(private syncStaffDomain: SyncStaffDomain) {}

  @Post('/staffs')
  public updateStaffInfo(
    @Ctx() ctx: IRouterContext,
    @Body() request: UpdateStaffRequestDto,
  ) {
    ctx.status = 200;
    return this.syncStaffDomain.updateStaffInfo(request);
  }

  @Post('/staffs/:staffCode/vacation')
  public createStaffVacationInfo(
    @Ctx() ctx: IRouterContext,
    @Param('staffCode') staffCode: string,
    @Body() request: CreateStaffVacationRequestDto,
  ) {
    ctx.status = 200;
    return this.syncStaffDomain.createStaffVacation(staffCode, request);
  }
}
