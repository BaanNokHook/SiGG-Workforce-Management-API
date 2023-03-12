import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { Inject } from 'typedi';
import { FmsService } from '../../../services/fms/fms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

enum PRIORITY {
  Critical = 3,
  High = 2,
  Medium = 1,
  Low = 0,
}

export class WFM_TRANSFORM_DATA_FOR_CREATE_TASK extends MelonadeAbstraction {
  readonly taskName = 'wfm_transform_data_for_create_task';
  constructor(@Inject('FmsService') private fmsService: FmsService) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order } = input;

    let windowTime: string[] = [];
    if (order.installationDate && order.timeSlot) {
      const timeSlotArr = order.timeSlot.split('-');
      const windowTimeStart = moment
        .tz(`${order.installationDate} ${timeSlotArr[0]}`, 'Asia/Bangkok')
        .toISOString();
      const windowTimeEnd = moment
        .tz(`${order.installationDate} ${timeSlotArr[1]}`, 'Asia/Bangkok')
        .toISOString();
      windowTime = [windowTimeStart, windowTimeEnd];
    } else if (order.ticket?.queue === 'A') {
      windowTime = [
        order.appointment?.appointmentFrom,
        order.appointment?.appointmentTo,
      ];

      if (!windowTime.length) {
        return super.workerFailed({ message: 'Can not define window time.' });
      }

      // updated meta info before create task
      order.metaInformation.baseInformation.deadline = moment(
        order.appointment.appointmentTo,
      ).format('YYYY-MM-DD HH:mm:ss');
      order.metaInformation.orderBaseInformation.appointmentTime = moment(
        order.appointment.appointmentFrom,
      ).format('YYYY-MM-DD HH:mm:ss');
      order.metaInformation.orderBaseInformation.deadline = moment(
        order.appointment.appointmentTo,
      ).format('YYYY-MM-DD HH:mm:ss');
      order.metaInformation.orderBaseInformation.planFinishTime = moment(
        order.appointment.appointmentTo,
      ).format('YYYY-MM-DD HH:mm:ss');
    }

    let areaCode = null;
    const teamCode = order.metaInformation?.installationInformation?.teamCode;
    if (teamCode) {
      const team = await this.fmsService.getTeamByCode(teamCode);
      areaCode = team?.zone[0]?.areaCode;
    }

    if (order.metaInformation?.warrantyInformation?.subcontractorCode === '') {
      delete order.metaInformation.warrantyInformation;
    }

    const baseModel = {
      tasks: [
        {
          address: order.address,
          information: {
            ...order.ticket,
            metaInformation: {
              areaInformation: { areaCode },
              ...order.metaInformation,
            },
            orderType: order.orderType,
          },
          appointment: {},
          staffs: [],
          direction: 'REPAIR',
          companyId: order.companyId,
          projectId: order.projectId,
          note: '',
          taskType: order.taskType._id,
          windowTime,
          standardTimeLength: order.taskType.durationTime,
          orderId: order.orderId,
          priority: order.priority ?? PRIORITY.Medium,
          requireSkills: order.taskType?.skills || [],
        },
      ],
      extensionType: 'QRUN',
      extensionFlow: 'WFM_DROP_NODES',
      note: '',
    };

    const output = {
      input,
      transactionId,
      baseModel,
    };

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
