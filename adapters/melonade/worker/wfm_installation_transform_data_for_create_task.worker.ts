import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_INSTALLATION_TRANSFORM_DATA_FOR_CREATE_TASK extends MelonadeAbstraction {
  readonly taskName = 'wfm_installation_transform_data_for_create_task';
  constructor() {
    super();
  }

  mergeInputOrder(order: any, orders: any[]): any[] {
    let resultOrders: any[] = [];

    if (order) {
      resultOrders.push(order);
    }

    if (Array.isArray(orders)) {
      resultOrders.push(...orders);
    }

    return resultOrders;
  }

  createBaseModelTaskByOrder(order: any): any {
    const staff = order?.staff;
    const installationDate =
      order?.metaInformation?.installationInformation?.installationDate;
    const timeSlot = order?.metaInformation?.installationInformation?.timeSlot;
    const timeSlotArr = timeSlot.split('-');

    const windowTimeStart = moment
      .tz(`${installationDate} ${timeSlotArr[0]}`, 'Asia/Bangkok')
      .toISOString();

    const windowTimeEnd = moment
      .tz(`${installationDate} ${timeSlotArr[1]}`, 'Asia/Bangkok')
      .toISOString();

    return {
      address: order.address,
      information: {
        contactInformation: {
          name: order.metaInformation?.installationInformation?.customerName,
          phone: order.metaInformation?.installationInformation?.contactPhone,
        },
        metaInformation: order.metaInformation,
      },
      appointment: {
        appointmentFrom: windowTimeStart,
        appointmentTo: windowTimeEnd,
        appointmentDate: installationDate,
      },
      staffs: [staff._id],
      direction: 'REPAIR',
      companyId: order.companyId,
      projectId: order.projectId,
      note: '',
      taskType: order.taskType._id,
      windowTime: [windowTimeStart, windowTimeEnd],
      standardTimeLength: order.taskType.durationTime,
      orderId: order.orderId,
    };
  }

  createCompensateBody(orders: any[]): any[] {
    return orders.map((inputOrder) => {
      return { staffId: inputOrder.staff._id, orderId: inputOrder.orderId };
    });
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order, orders } = input;

    const inputOrders = this.mergeInputOrder(order, orders);

    const tasks = inputOrders.map((inputOrder) => {
      return this.createBaseModelTaskByOrder(inputOrder);
    });

    const compensateBody = this.createCompensateBody(inputOrders);

    const baseModel = {
      tasks: tasks,
      extensionType: 'QRUN',
      extensionFlow: 'WFM_CREATE_TRIP',
      note: '',
      orderId: tasks[0].orderId,
    };

    const output = {
      input,
      transactionId,
      baseModel,
      compensateBody,
    };

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
