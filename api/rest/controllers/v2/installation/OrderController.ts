import { IRouterContext } from 'koa-router';
import { Body, Controller, Ctx, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { OrderDomain } from '../../../../../domains/installation/order.domain';
import { IWFMOrderResponse } from '../../../../../domains/installation/order.interface';
import { consoleLogger } from '../../../../../logger';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  ICancelOrderInquiryRequest,
  ICancelOrderInquiryResponse,
  ICancelOrderRequest,
  ICancelOrderResponse,
  IGetOrderInfomation,
  IGetOrderInformationRequest,
  IOrderInformation
} from './Order.dto';

@Controller('/v2/installation')
export class InstallationOrderController {
  constructor(private orderDomain: OrderDomain) { }

  @Post('/orders')
  @ResponseSchema(CreateOrderResponse)
  public async create(
    @Ctx() ctx: IRouterContext,
    @Body() request: CreateOrderRequest,
  ) {
    ctx.status = 201;
    return this.orderDomain.create(request);
  }

  @Post('/update-order')
  @ResponseSchema(CreateOrderResponse)
  public async update(
    @Ctx() ctx: IRouterContext,
    @Body() request: CreateOrderRequest,
  ) {
    ctx.status = 200;
    return this.orderDomain.update(request);
  }

  @Post('/cancel-order-inquiry')
  @ResponseSchema(ICancelOrderInquiryResponse)
  public async canCancel(
    @Ctx() ctx: IRouterContext,
    @Body() request: ICancelOrderInquiryRequest,
  ) {
    ctx.status = 200;
    const { orderNoSet } = request;
    const productOrderListNo = orderNoSet.split(',');
    const _productOrderListNo = productOrderListNo.map((productOrderNo) =>
      productOrderNo.trim(),
    );
    return this.orderDomain.canCancel(_productOrderListNo);
  }

  @Post('/cancel-order')
  @ResponseSchema(ICancelOrderResponse)
  public async cancel(
    @Ctx() ctx: IRouterContext,
    @Body() request: ICancelOrderRequest,
  ) {
    ctx.status = 200;
    return this.orderDomain.cancel(request);
  }

  @Post('/order-information')
  @ResponseSchema(IGetOrderInfomation)
  public async getOrderInformation(
    @Ctx() ctx: IRouterContext,
    @Body() request: IGetOrderInformationRequest,
  ): Promise<IWFMOrderResponse<IOrderInformation[]>> {
    ctx.status = 200;
    try {
      const workOrderList = await this.orderDomain.getOrderInformation(request);

      return {
        workOrderList,
        resultCode: '0',
        resultDesc: 'success',
      };
    } catch (e) {
      consoleLogger.error(e);

      return {
        workOrderList: [],
        resultCode: '1',
        resultDesc: e.message,
      };
    }
  }
}
