import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { CFMService } from '../../../services/cfm/cfm.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_DELETE_ORDER_CLOSE_TICKET_CFM extends MelonadeAbstraction {
  readonly taskName = 'wfm_delete_order_close_ticket_cfm';
  constructor(@Inject('CFMService') private cfmService: CFMService) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { recNo, ticketNo } = input;
    try {
      await this.cfmService.deleteCloseTicket(`/close-tickets/${ticketNo}`);
    } catch (err) {
      const output = {
        input,
        transactionId,
        err,
      };
      this.logger.error({
        event: 'wfm_delete_order_close_ticket_cfm',
        recNo: recNo,
        ticketNo: ticketNo,
        message: `System can't delete cfm ticket ticketNo : ${ticketNo}`,
      });
      return super.workerFailed(output);
    }

    const output = {
      input,
      transactionId,
    };

    this.logger.info({
      event: 'wfm_delete_order_close_ticket_cfm',
      recNo: recNo,
      ticketNo: ticketNo,
      message: `System delete cfm ticket success ticketNo : ${ticketNo}`,
    });

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
