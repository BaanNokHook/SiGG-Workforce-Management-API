import { IRouterContext } from 'koa-router';
import {
  Body,
  Controller,
  Ctx,
  Get,
  Param,
  Patch,
  Post,
  QueryParams,
  UseBefore
} from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { ManualOrderDomain } from '../../../../domains/order/manualOrder/manualOrder.domain';
import { OrderDomain } from '../../../../domains/order/order.domain';
import {
  OrderCloseDto,
  OrderInstallationRequestDto,
  OrderInstallationUpdateStatusRequestDto,

  OrderManualDto, OrderRequestDto
} from './Order.dto';

@Controller('/v1/orders')
@UseBefore(enableTracing)
export class OrderController {
  constructor(
    private orderDomain: OrderDomain,
    private manualOrderDomain: ManualOrderDomain,
  ) { }

  @Get('/:workOrderNo')
  public async get(
    @Ctx() ctx: IRouterContext,
    @Param('workOrderNo') workOrderNo: string,
  ) {
    ctx.status = 200;
    return this.orderDomain.get(workOrderNo);
  }

  @Post()
  public async create(
    @Ctx() ctx: IRouterContext,
    @Body() request: OrderRequestDto,
  ) {
    ctx.status = 201;
    return this.orderDomain.create(request, 'WFM_CREATED_ORDER_V2');
  }

  @Post('/installation')
  public async installation(
    @Ctx() ctx: IRouterContext,
    @Body() request: OrderInstallationRequestDto,
    @QueryParams() options: any,
  ) {
    ctx.status = 201;
    return this.orderDomain.createInstallation(request, options);
  }

  @Patch('/installation/:taskOrderNo')
  public async installationUpdateStatus(
    @Param('taskOrderNo') taskOrderNo: string,
    @Body() request: OrderInstallationUpdateStatusRequestDto,
  ) {
    return this.orderDomain.updateInstallationOrderStatus(taskOrderNo, request);
  }

  @Post('/close')
  public async close(
    @Ctx() ctx: IRouterContext,
    @Body() request: OrderCloseDto,
  ) {
    ctx.status = 200;
    return this.orderDomain.close(request);
  }

  @Post('/manual')
  public async createManualOrder(
    @Ctx() ctx: IRouterContext,
    @Body() request: OrderManualDto,
  ) {
    ctx.status = 200;
    return this.manualOrderDomain.createManualOrder(request);
  }
}
