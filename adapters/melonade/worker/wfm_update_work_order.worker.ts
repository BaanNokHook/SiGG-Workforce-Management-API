import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { config } from '../../../bootstrapConfig';
import { CFMService } from '../../../services/cfm/cfm.service';
import { IUpdateWorkOrder } from '../../../services/cfm/interface';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_UPDATE_WORK_ORDER extends MelonadeAbstraction {
  readonly taskName = 'wfm_update_work_order';
  constructor(@Inject('CFMService') private cfmService: CFMService) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order } = input;
    const payload: IUpdateWorkOrder = {
      productID: order.workflowInput.ticket.prodId,
      ticketNumber: order.workflowInput.ticket.ticketNo,
      workOrderNO: order.orderId,
      companyId: config.system.COMPANY_ID as string,
      projectId: config.system.PROJECT_ID as string,
      actionType: 'Created',
      requestType: '2',
    };
    try {
      await this.cfmService.updateWorkOrder(payload);
    } catch (err) {
      throw err;
    }

    const output = {
      input,
      transactionId,
    };

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
