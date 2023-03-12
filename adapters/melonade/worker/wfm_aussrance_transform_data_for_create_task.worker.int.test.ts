import { mock } from 'jest-mock-extended';
import { OrderService } from '../../restClient/order/order.service';
import { WFM_ASSURANCE_TRANSFORM_DATA_FOR_CREATE_TASK } from './wfm_assurance_transform_data_for_create_task.worker';

jest.mock('moment-timezone', () => {
  return {
    tz: () => ({
      format: () => '2021-02-15',
    }),
  };
});

describe('WFM_ASSURANCE_TRANSFORM_DATA_FOR_CREATE_TASK', () => {
  const orderService = mock<OrderService>();
  const worker = new WFM_ASSURANCE_TRANSFORM_DATA_FOR_CREATE_TASK(orderService);

  test('transformDataToOmsOrderToPrepareTask', async () => {
    const expectOutput = {
      output: {
        input: {
          route: [
            {
              id: 'staff_1',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '16:00',
              planStartTime: '15:00',
              serviceTime: 60,
              timeWindowEnd: 1600,
              timeWindowStart: 1500,
              travelingTime: 60,
            },
            {
              id: 'order_1',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '16:00',
              planStartTime: '15:00',
              serviceTime: 60,
              timeWindowEnd: 1600,
              timeWindowStart: 1500,
              travelingTime: 60,
            },
            {
              id: 'order_2',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '17:00',
              planStartTime: '16:00',
              serviceTime: 60,
              timeWindowEnd: 1700,
              timeWindowStart: 1600,
              travelingTime: 60,
            },
            {
              id: 'staff_1',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '16:00',
              planStartTime: '15:00',
              serviceTime: 60,
              timeWindowEnd: 1600,
              timeWindowStart: 1500,
              travelingTime: 60,
            },
          ],
          vehicleID: 'staff_1',
        },
        order: {
          extensionFlow: 'WFM_CREATE_TRIP',
          extensionType: 'QRUN',
          note: '',
          orderId: 'order_1',
          tasks: [
            {
              address: { location: 'location_1' },
              appointment: {
                appointmentDate: '2021-02-15',
                appointmentFrom: '2021-02-15T02:00:00.000Z',
                appointmentTo: '2021-02-15T03:00:00.000Z',
              },
              companyId: '5cee7a9bfc47036f05b13847',
              direction: 'REPAIR',
              information: {
                queue: 'A',
                metaInformation: {
                  orderBaseInformation: {
                    planFinishTime: '2021-02-15 16:00:00',
                    planStartTime: '2021-02-15 15:00:00',
                    travelingTime: 60,
                  },
                },
              },
              note: '',
              orderId: 'order_1',
              projectId: '5cf0ad79b603c7605955bc7f',
              remarks: null,
              staffs: ['staff_1'],
              standardTimeLength: 0,
              taskType: 't_1',
              windowTime: ['2021-02-15 15:00:00', '2021-02-15 16:00:00'],
              priority: 0,
            },
            {
              address: { location: 'location_2' },
              appointment: {
                appointmentDate: '2021-02-15',
                appointmentFrom: '2021-02-15T03:00:00.000Z',
                appointmentTo: '2021-02-15T04:00:00.000Z',
              },
              companyId: '5cee7a9bfc47036f05b13847',
              direction: 'REPAIR',
              information: {
                queue: 'A',
                metaInformation: {
                  orderBaseInformation: {
                    planFinishTime: '2021-02-15 17:00:00',
                    planStartTime: '2021-02-15 16:00:00',
                    travelingTime: 60,
                  },
                },
              },
              note: '',
              orderId: 'order_2',
              projectId: '5cf0ad79b603c7605955bc7f',
              remarks: null,
              staffs: ['staff_1'],
              standardTimeLength: 0,
              taskType: 't_2',
              windowTime: ['2021-02-15 16:00:00', '2021-02-15 17:00:00'],
              priority: 1,
            },
          ],
        },
        transactionId: 'test_transaction_id',
      },
      status: 'COMPLETED',
    };

    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: 'staff_1',
        route: [
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          priority: 0,
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T02:00:00.000Z',
            appointmentTo: '2021-02-15T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
      {
        orderId: 'order_2',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_2' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T03:00:00.000Z',
            appointmentTo: '2021-02-15T04:00:00.000Z',
          },
          taskType: { _id: 't_2' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    expect(output).toEqual(expectOutput);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });

  test('transformDataDropNodeToOmsOrderToPrepareTask', async () => {
    const expectOutput = {
      output: {
        input: {
          route: [
            {
              id: 'order_1',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '16:00',
              planStartTime: '15:00',
              serviceTime: 60,
              timeWindowEnd: 1600,
              timeWindowStart: 1500,
              travelingTime: 60,
            },
            {
              id: 'order_2',
              lat: 12.68226,
              lng: 101.283331,
              planFinishTime: '17:00',
              planStartTime: '16:00',
              serviceTime: 60,
              timeWindowEnd: 1700,
              timeWindowStart: 1600,
              travelingTime: 60,
            },
          ],
          vehicleID: '',
        },
        order: {
          extensionFlow: 'WFM_DROP_NODES',
          extensionType: 'QRUN',
          note: '',
          orderId: 'order_1',
          tasks: [
            {
              address: { location: 'location_1' },
              appointment: {
                appointmentDate: '2021-02-15',
                appointmentFrom: '2021-02-15T02:00:00.000Z',
                appointmentTo: '2021-02-15T03:00:00.000Z',
              },
              companyId: '5cee7a9bfc47036f05b13847',
              direction: 'REPAIR',
              information: {
                queue: 'A',
                metaInformation: {
                  orderBaseInformation: {
                    planFinishTime: '2021-02-15 16:00:00',
                    planStartTime: '2021-02-15 15:00:00',
                    travelingTime: 60,
                  },
                },
              },
              note: '',
              orderId: 'order_1',
              projectId: '5cf0ad79b603c7605955bc7f',
              remarks: null,
              staffs: [],
              standardTimeLength: 0,
              taskType: 't_1',
              windowTime: ['2021-02-15 15:00:00', '2021-02-15 16:00:00'],
              priority: 1,
            },
            {
              address: { location: 'location_2' },
              appointment: {
                appointmentDate: '2021-02-15',
                appointmentFrom: '2021-02-15T03:00:00.000Z',
                appointmentTo: '2021-02-15T04:00:00.000Z',
              },
              companyId: '5cee7a9bfc47036f05b13847',
              direction: 'REPAIR',
              information: {
                queue: 'A',
                metaInformation: {
                  orderBaseInformation: {
                    planFinishTime: '2021-02-15 17:00:00',
                    planStartTime: '2021-02-15 16:00:00',
                    travelingTime: 60,
                  },
                },
              },
              note: '',
              orderId: 'order_2',
              projectId: '5cf0ad79b603c7605955bc7f',
              remarks: null,
              staffs: [],
              standardTimeLength: 0,
              taskType: 't_2',
              windowTime: ['2021-02-15 16:00:00', '2021-02-15 17:00:00'],
              priority: 1,
            },
          ],
        },
        transactionId: 'test_transaction_id',
      },
      status: 'COMPLETED',
    };

    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: '',
        route: [
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T02:00:00.000Z',
            appointmentTo: '2021-02-15T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
      {
        orderId: 'order_2',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_2' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T03:00:00.000Z',
            appointmentTo: '2021-02-15T04:00:00.000Z',
          },
          taskType: { _id: 't_2' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    expect(output).toEqual(expectOutput);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });

  test('skip when order not found', async () => {
    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: 'staff_1',
        route: [
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          priority: 0,
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T02:00:00.000Z',
            appointmentTo: '2021-02-15T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    const outputOrderIds = output.output.order.tasks.map(
      (task: any) => task.orderId,
    );
    expect(outputOrderIds).toEqual(['order_1']);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });

  test('skip when order appointment date is changed (no date from route)', async () => {
    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: 'staff_1',
        route: [
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          priority: 0,
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-25',
            appointmentFrom: '2021-02-25T02:00:00.000Z',
            appointmentTo: '2021-02-25T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
      {
        orderId: 'order_2',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_2' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T03:00:00.000Z',
            appointmentTo: '2021-02-15T04:00:00.000Z',
          },
          taskType: { _id: 't_2' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    const outputOrderIds = output.output.order.tasks.map(
      (task: any) => task.orderId,
    );
    expect(outputOrderIds).toEqual(['order_2']);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });

  test('skip when order appointment date is changed (with date from route)', async () => {
    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: 'staff_1',
        route: [
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
            date: '2021-02-12',
          },
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
            date: '2021-02-12',
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
            date: '2021-02-12',
          },
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
            date: '2021-02-12',
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          priority: 0,
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-25',
            appointmentFrom: '2021-02-25T02:00:00.000Z',
            appointmentTo: '2021-02-25T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
      {
        orderId: 'order_2',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_2' },
          appointment: {
            appointmentDate: '2021-02-12',
            appointmentFrom: '2021-02-12T03:00:00.000Z',
            appointmentTo: '2021-02-12T04:00:00.000Z',
          },
          taskType: { _id: 't_2' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    const outputOrderIds = output.output.order.tasks.map(
      (task: any) => task.orderId,
    );
    expect(outputOrderIds).toEqual(['order_2']);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });

  test('skip when order status is not "WFM_WAIT_FOR_OPTIMIZE"', async () => {
    const input = {
      transactionId: 'test_transaction_id',
      input: {
        vehicleID: 'staff_1',
        route: [
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'order_2',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1600,
            timeWindowEnd: 1700,
            planStartTime: '16:00',
            planFinishTime: '17:00',
            travelingTime: 60,
            serviceTime: 60,
          },
          {
            id: 'staff_1',
            lat: 12.68226,
            lng: 101.283331,
            timeWindowStart: 1500,
            timeWindowEnd: 1600,
            planStartTime: '15:00',
            planFinishTime: '16:00',
            travelingTime: 60,
            serviceTime: 60,
          },
        ],
      },
    } as any;

    orderService.getOrderByIds.mockResolvedValue([
      {
        orderId: 'order_1',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          priority: 0,
          address: { location: 'location_1' },
          appointment: {
            appointmentDate: '2021-02-25',
            appointmentFrom: '2021-02-25T02:00:00.000Z',
            appointmentTo: '2021-02-25T03:00:00.000Z',
          },
          taskType: { _id: 't_1' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'XXX',
      },
      {
        orderId: 'order_2',
        workflowInput: {
          ticket: { queue: 'A', metaInformation: { orderBaseInformation: {} } },
          address: { location: 'location_2' },
          appointment: {
            appointmentDate: '2021-02-15',
            appointmentFrom: '2021-02-15T03:00:00.000Z',
            appointmentTo: '2021-02-15T04:00:00.000Z',
          },
          taskType: { _id: 't_2' },
          metaInformation: {
            orderBaseInformation: {},
          },
        },
        currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
      },
    ]);

    const output = await worker.process(input);

    const outputOrderIds = output.output.order.tasks.map(
      (task: any) => task.orderId,
    );
    expect(outputOrderIds).toEqual(['order_2']);
    expect(orderService.getOrderByIds).toHaveBeenCalledWith([
      'order_1',
      'order_2',
    ]);
  });
});
