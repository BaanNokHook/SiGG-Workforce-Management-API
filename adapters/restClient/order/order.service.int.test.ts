import { OrderService } from './order.service';
import { IAssuranceOrder, IInstallationOrder } from './type';

describe('OmsService', () => {
  const omsEndpoint = 'http://app-4pl-oms-api.drivs.staging.tel.internal';
  const omsService = new OrderService(omsEndpoint);

  // test('get installation orders', async () => {
  //   let orders = await omsService.getInstallationOrders(
  //     ['ABC123'],
  //     '2020-11-03',
  //   );

  //   expect(orders[0].orderId).toEqual('b1376f40-1dad-11eb-8d5d-2be8c2cc35b0-1');
  // });

  test('get order by orderId', async () => {
    let order = await omsService.getOrderByOrderId<IInstallationOrder>(
      '9de9dff0-259f-11eb-8c58-913d9996eeb5-1',
    );

    expect(order?.orderId).toEqual('9de9dff0-259f-11eb-8c58-913d9996eeb5-1');
  });

  test('get order by orderId not found should return undefined', async () => {
    let order = await omsService.getOrderByOrderId<IAssuranceOrder>('dfdfasdf');

    expect(order).toBeUndefined();
  });

  test('get orders by ids', async () => {
    let orders = await omsService.getOrderByIds([
      '97146130-6aa7-11eb-af07-8141aedccf16-1',
      '3f9ea170-6aa9-11eb-af07-8141aedccf16-1',
    ]);

    expect(orders.length).toEqual(2);
  });

  test('get order already have staff', async () => {
    let order = await omsService.getOrderByOrderId<IInstallationOrder>(
      'c6252a30-54aa-11eb-b4c1-b3f0e1a6afd2-1',
    );

    expect(order?.workflowInput.staff?.metaData.staffCode).toEqual(
      'MOSINSTALL',
    );
  });
});
