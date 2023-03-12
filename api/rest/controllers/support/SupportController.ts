import { IRouterContext } from 'koa-router';
import {
  Body,
  Controller,
  Ctx,
  Get,
  Param,
  Post,
  UploadedFile,
} from 'routing-controllers';
import { PreProcessOptimizeDomain } from '../../../../domains/preProcessOptimize/preProcessOptimize.domain';
import { SupportDomain } from '../../../../domains/support/support.domain';
import { SupportInstallationDomain } from '../../../../domains/support/supportInstallation.domain';
import {
  CheckAppointmentRequest,
  ListOrderCanVisitByStaffIdRequest,
  ListStaffCanVisitByOrderIdRequest,
  ORtoQARequest,
  SupportStaffVacationDTO,
  SUPPORT_VACATION_ACTION,
} from './SupportController.dto';

@Controller('/v1/wfm-support')
export class SupportController {
  constructor(
    private supportDomain: SupportDomain,
    private supportInstallationDomain: SupportInstallationDomain,
    private preProcessOptimizeDomain: PreProcessOptimizeDomain,
  ) {}

  @Get('/ticket/:ticketNo')
  async getCurrentTicketRecord(@Param('ticketNo') ticketNo: string) {
    const res = await this.supportDomain.getCurrentTicketRecord(ticketNo);
    return {
      statusCode: 200,
      status: 'success',
      data: res,
    };
  }

  @Post('/ticket/withdraw/:ticketNo')
  async withdrawTaskToTaskpool(@Param('ticketNo') ticketNo: string) {
    const res = await this.supportDomain.withdrawTaskToTaskPool(ticketNo);
    return res;
  }

  @Post('/ticket/withdraw-permanently/:ticketNo')
  async withdrawTaskPermanently(@Param('ticketNo') ticketNo: string) {
    const res = await this.supportDomain.withdrawTaskPermanently(ticketNo);
    return res;
  }

  @Post('/ticket/:ticketNo/readFlag')
  async updateReadFlag(@Param('ticketNo') ticketNo: string) {
    await this.supportDomain.updateReadFlag(ticketNo);
    return {
      statusCode: 200,
      status: 'success',
    };
  }

  @Post('/ticket/:ticketNo/return')
  async return(@Param('ticketNo') ticketNo: string) {
    const res = await this.supportDomain.returnTask(ticketNo);
    return {
      statusCode: 200,
      status: 'success',
      data: res,
    };
  }

  @Post('/clear-vacations-order-error')
  processStaffVacation(
    @Ctx() ctx: IRouterContext,
    @Body() request: SupportStaffVacationDTO,
  ) {
    ctx.status = 200;
    return request.action === SUPPORT_VACATION_ACTION.VIEW
      ? this.supportInstallationDomain.getActiveStaffVacation(request)
      : this.supportInstallationDomain.removeActiveStaffVacation(request);
  }

  @Post('/check-optimize-result-order')
  public async listStaffCanVisitByOrderId(
    @Ctx() ctx: IRouterContext,
    @Body() request: ListStaffCanVisitByOrderIdRequest,
  ) {
    const { orderId, date } = request;

    const resp = await this.preProcessOptimizeDomain.listStaffCanVisitByOrderId(
      date,
      orderId,
    );

    ctx.status = 200;
    return resp;
  }

  @Post('/check-optimize-result-staff')
  public async listOrderCanVisitByStaffId(
    @Ctx() ctx: IRouterContext,
    @Body() request: ListOrderCanVisitByStaffIdRequest,
  ) {
    const { staffId, date } = request;

    const resp = await this.preProcessOptimizeDomain.listOrderCanVisitByStaffId(
      date,
      staffId,
    );

    ctx.status = 200;
    return resp;
  }

  @Post('/create-new-qa-from-qr')
  public async createNewQAFromQR(
    @Ctx() ctx: IRouterContext,
    @Body() request: ORtoQARequest,
  ) {
    const { appointmentNo, ticketNo } = request;
    const resp = await this.supportDomain.createNewQAFromQR(
      ticketNo,
      appointmentNo,
    );
    ctx.status = 201;
    return resp;
  }

  @Post('/check-appointment')
  public async checkAppointment(
    @Ctx() ctx: IRouterContext,
    @Body() request: CheckAppointmentRequest,
  ) {
    const { staffId, timeSlot, date } = request;
    const resp = await this.supportDomain.checkAppointment(
      staffId,
      timeSlot,
      date,
    );
    ctx.status = 200;

    return {
      statusCode: 200,
      status: 'success',
      data: resp,
    };
  }

  @Post('/check-no-workorder')
  public async checkNoWorkOrder(
    @Ctx() ctx: IRouterContext,
    @UploadedFile('fileName') file: any,
  ) {
    if (
      file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      throw new Error('Invalid file type, only .XLXS supported');
    }
    const resp = await this.supportDomain.checkNoWorkOrder(file);

    ctx.status = 200;

    return {
      statusCode: 200,
      status: 'success',
      data: resp,
    };
  }
}
