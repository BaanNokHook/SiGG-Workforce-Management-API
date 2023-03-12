import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { OmsService } from '../../../services/oms/oms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_UPDATE_ORDER_STATUS_INFORMATION extends MelonadeAbstraction {
  readonly taskName = 'wfm_update_order_status_information';
  constructor(@Inject('OmsService') private omsService: OmsService) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { inputOrderStatus, currentOrderStatus, orderId } = input;

    const order = await this.omsService.get(`/v1/order/${orderId}`);

    let update: any = {};
    if (currentOrderStatus) {
      update['currentOrderStatus'] = currentOrderStatus;
    }

    if (inputOrderStatus) {
      update['orderStatuses'] = [
        ...order.orderStatuses,
        {
          status: inputOrderStatus,
          updatedAt: Date.now(),
        },
      ];
    }

    await this.omsService.update(`/v1/order/${orderId}`, {
      data: update,
    });

    this.logger.info({
      event: this.taskName,
      orderId: orderId,
      message: `Update order : ${orderId}`,
    });

    const output = {
      input,
      transactionId,
      order,
    };
    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
