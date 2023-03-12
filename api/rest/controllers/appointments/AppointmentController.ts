import { IRouterContext } from 'koa-router';
import { Body, Controller, Ctx, Post, UseBefore } from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { AppointmentDomain } from '../../../../domains/appointment/appointment.domain';
import { AppointmentRequestDto } from './Appointment.dto';

@Controller('/v1/appointments')
@UseBefore(enableTracing)
export class AppointmentController {
  constructor(private appointmentDomain: AppointmentDomain) {}

  @Post()
  public async create(
    @Ctx() ctx: IRouterContext,
    @Body() request: AppointmentRequestDto,
  ) {
    const created = await this.appointmentDomain.create(request);
    ctx.status = 201;
    return created;
  }
}
