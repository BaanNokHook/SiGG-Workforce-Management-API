import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { MelonadeAbstraction } from '../melonade.abstraction';

enum PRIORITY {
  Critical = 3,
  High = 2,
  Medium = 1,
  Low = 0,
}

export class WFM_TRANSFORM_ORDER_TO_CREATE_TASK extends MelonadeAbstraction {
  readonly taskName = 'wfm_transform_order_to_create_task';

  constructor() {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order, appointment } = input;

    const windowTime = [
      appointment?.appointmentFrom,
      appointment?.appointmentTo,
    ];

    const baseModel = {
      tasks: [
        {
          address: order.address,
          information: {
            orderType: order.orderType,
          },
          appointmentNo: appointment?.appointmentNo,
          staffs: [order.staffId],
          direction: 'REPAIR',
          companyId: order.companyId,
          projectId: order.projectId,
          taskTypeId: order.taskTypeId,
          windowTime,
          standardTimeLength: appointment?.metaData?.durationAsMinutes,
          orderId: order.orderId,
          priority: PRIORITY.Medium,
        },
      ],
      extensionType: 'QRUN',
      note: '',
    };

    const output = {
      input,
      transactionId,
      baseModel,
    };

    this.logger.info(
      { event: task.taskReferenceName, transactionId },
      JSON.stringify(baseModel),
    );

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
