import { WFM_INSTALLATION_TRANSFORM_DATA_FOR_CREATE_TASK } from './wfm_installation_transform_data_for_create_task.worker';

describe('WFM_INSTALLATION_TRANSFORM_DATA_FOR_CREATE_TASK', () => {
  const worker = new WFM_INSTALLATION_TRANSFORM_DATA_FOR_CREATE_TASK();

  const order = {
    extensionFlow: 'WFM_INSTALLATION_CREATED_ORDER',
    address: {
      address: {
        address: 'Hougang Building,Postal Code 123408, Building 10, 1201',
        pois: [],
      },
    },
    staff: {
      _id: '5ff46515676afe900c9ea3a9',
    },
    taskType: {
      _id: '5f8ffee5682315f66f8b90b8',
      durationTime: 180,
    },
    metaInformation: {
      installationInformation: {
        customerName: 'lucky',
        contactPhone: '6287666',
        installationDate: '2021-01-06',
        timeSlot: '13:00-18:00',
      },
    },
    companyId: '5cee7a9bfc47036f05b13847',
    projectId: '5f895cb6a009ca2df08315cb',
    orderId: 'ab322c00-4fe1-11eb-b7e1-29e327d0e5e1-1',
  };

  test('mergeInputOrder with single order', () => {
    const result = worker.mergeInputOrder(order, []);
    expect(result).toEqual([order]);

    const result2 = worker.mergeInputOrder(order, undefined as any);
    expect(result2).toEqual([order]);

    const result3 = worker.mergeInputOrder(order, {} as any);
    expect(result3).toEqual([order]);

    const result4 = worker.mergeInputOrder(order, null as any);
    expect(result4).toEqual([order]);
  });

  test('mergeInputOrder with multiple orders', () => {
    const result = worker.mergeInputOrder(null as any, [order]);
    expect(result).toEqual([order]);

    const result2 = worker.mergeInputOrder(undefined as any, [order]);
    expect(result2).toEqual([order]);

    const result4 = worker.mergeInputOrder(null as any, [order, order]);
    expect(result4).toEqual([order, order]);
  });

  test('mergeInputOrder with single and mutiple orders', () => {
    const result = worker.mergeInputOrder(order, [order, order]);
    expect(result).toEqual([order, order, order]);
  });

  test('createCompensateBody', () => {
    const result = worker.createCompensateBody([order, order]);
    expect(result).toEqual([
      {
        staffId: '5ff46515676afe900c9ea3a9',
        orderId: 'ab322c00-4fe1-11eb-b7e1-29e327d0e5e1-1',
      },
      {
        staffId: '5ff46515676afe900c9ea3a9',
        orderId: 'ab322c00-4fe1-11eb-b7e1-29e327d0e5e1-1',
      },
    ]);
  });
});
