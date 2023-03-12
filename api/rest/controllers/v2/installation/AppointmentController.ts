import { Body, Controller, Post, UseBefore } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { enableTracing } from '../../../../../bootstrapRestApi';
import { AppointmentInstallationDomain } from '../../../../../domains/installation/appointment.domain';
import {
  ListAppointmentCapabilitiesRequestDto,
  ListAppointmentCapabilitiesResponseDto,
  ListAppointmentSlotsRequestDto,
  ListOrdersAllowToChangeRequestDto,
  ListOrdersAllowToChangeResponseDto,
  ReAppointmentRequestDto,
  ReserveOrChangeAppointmentRequestDto,
  ReserveOrChangeAppointmentResponseDto,
  UpdoAppointmentRequestDto,
  UpdoAppointmentResponseDto
} from './Appointment.dto';

@Controller('/v2/installation')
@UseBefore(enableTracing)
export class AppointmentInstallationController {
  constructor(private appointmentDomain: AppointmentInstallationDomain) { }

  @Post('/query-appointments')
  @ResponseSchema(ListAppointmentCapabilitiesResponseDto)
  async listCapabilities(
    @Body() request: ListAppointmentCapabilitiesRequestDto,
  ) {
    return this.appointmentDomain.listCapabilities(request);
  }

  @Post('/reappointments')
  async reappointment(
    @Body() request: ReAppointmentRequestDto,
  ) {
    return this.appointmentDomain.reappointment(request);
  }

  @Post('/appointments/slots')
  @ResponseSchema(ListAppointmentCapabilitiesResponseDto)
  async getAppointmentSlots(
    @Body() request: ListAppointmentSlotsRequestDto,
  ) {
    return this.appointmentDomain.getAppointmentSlots(request);
  }

  @Post('/change-appointments-inquiry')
  @ResponseSchema(ListOrdersAllowToChangeResponseDto)
  async listOrdersAllowToChange(
    @Body() request: ListOrdersAllowToChangeRequestDto,
  ) {
    const { ORDER_NBR_SET } = request;
    const productOrderListNo = ORDER_NBR_SET.split(',');
    const _productOrderListNo = productOrderListNo.map((productOrderNo) =>
      productOrderNo.trim(),
    );
    return this.appointmentDomain.canChange(_productOrderListNo);
  }

  @Post('/reserve-appointments')
  @ResponseSchema(ReserveOrChangeAppointmentResponseDto)
  async reserveOrChange(@Body() request: ReserveOrChangeAppointmentRequestDto) {
    return this.appointmentDomain.reserveOrChange(request);
  }

  @Post('/undo-appointments')
  @ResponseSchema(UpdoAppointmentResponseDto)
  async undo(@Body() request: UpdoAppointmentRequestDto) {
    return this.appointmentDomain.undo(request);
  }
}
