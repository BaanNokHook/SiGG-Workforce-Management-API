import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { Inject } from 'typedi';
import { TmsService } from '../../../services/tms/tms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_TRANSFORM_DATA_FOR_CREATE_TASK extends MelonadeAbstraction {
  readonly taskName = 'wfm_installation_check_task_of_staff_at_13_00';

  constructor(@Inject('TmsService') private tmsService: TmsService) {
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

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order, orders } = input;

    const inputOrders = this.mergeInputOrder(order, orders);

    let isExistTaskAtNoonOnTms = await this.checkExistTaskAtNoonOnTms(
      inputOrders[0]?.staff._id,
      inputOrders[0]?.metaInformation?.installationInformation
        ?.installationDate,
    );
    const tasks = this.convertOrdersToTasks(
      inputOrders,
      isExistTaskAtNoonOnTms,
    );

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
    };

    return super.workerCompleted(output);
  }

  convertOrdersToTasks(inputOrders: any[], isExistTaskAtNoonOnTms: boolean) {
    const taskSlotsOnTx: string[] = [];
    const tasks = inputOrders.map((order: any) => {
      return this.convertOrderToTask(
        order,
        taskSlotsOnTx,
        isExistTaskAtNoonOnTms,
      );
    });
    return tasks;
  }

  async checkExistTaskAtNoonOnTms(staffId: string, installationDate: string) {
    const atNoon = moment
      .tz(`${installationDate} 13:00`, 'Asia/Bangkok')
      .toISOString();

    const query = `/v1/tasks?search={"staffs":"${staffId}","windowTime.0":{"$eq":"${atNoon}"}}`;
    const taskOfStaffAtNoon = await this.tmsService.get(query);

    let isExistTaskAtNoonOnDB = false;
    if (taskOfStaffAtNoon.total > 0) isExistTaskAtNoonOnDB = true;

    return isExistTaskAtNoonOnDB;
  }

  convertOrderToTask(
    order: any,
    taskSlotsOnTx: string[],
    isExistTaskAtNoonOnTms: boolean,
  ) {
    const staff = order?.staff;

    const installationInformation =
      order?.metaInformation?.installationInformation;
    const installationDate = installationInformation?.installationDate;
    const timeSlot = installationInformation?.timeSlot;
    const timeSlots = timeSlot.split('-');

    let startAt = moment
      .tz(`${installationDate} ${timeSlots[0]}`, 'Asia/Bangkok')
      .toISOString();

    let endAt = moment
      .tz(
        `${installationDate} ${timeSlots[0] === '13:00' ? '16:00' : timeSlots[1]
        }`,
        'Asia/Bangkok',
      )
      .toISOString();

    // Check staff has already exist task on 13:00
    if (timeSlots[0] === '13:00') {
      const isExistTaskAtNoonOnOrders = taskSlotsOnTx.includes('13:00');

      if (isExistTaskAtNoonOnOrders || isExistTaskAtNoonOnTms) {
        startAt = moment
          .tz(`${installationDate} 15:00`, 'Asia/Bangkok')
          .toISOString();

        endAt = moment
          .tz(`${installationDate} 18:00`, 'Asia/Bangkok')
          .toISOString();

        taskSlotsOnTx.push('15:00');
      } else {
        taskSlotsOnTx.push('13:00');
      }
    }

    return {
      address: order.address,
      information: {
        ticketInfo: {
          contactName:
            order.metaInformation?.installationInformation?.contactName,
          customerName:
            order.metaInformation?.installationInformation?.customerName,
          contactMobile1:
            order.metaInformation?.installationInformation?.contactPhone,
        },
        contactInformation: {
          name: order.metaInformation?.installationInformation?.customerName,
          phone: order.metaInformation?.installationInformation?.contactPhone,
        },
        metaInformation: order.metaInformation,
      },
      appointment: {
        appointmentFrom: startAt,
        appointmentTo: endAt,
        appointmentDate: installationDate,
      },
      staffs: [staff._id],
      direction: 'REPAIR',
      companyId: order.companyId,
      projectId: order.projectId,
      note: '',
      taskType: order.taskType._id,
      windowTime: [startAt, endAt],
      standardTimeLength: order.taskType.durationTime,
      orderId: order.orderId,
      priority: order?.priority,
    };
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
