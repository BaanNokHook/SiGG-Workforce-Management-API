import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { CFMService } from '../../../services/cfm/cfm.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_UPDATE_READ_FLAG extends MelonadeAbstraction {
  readonly taskName = 'wfm_update_read_flag';
  constructor(@Inject('CFMService') private cfmService: CFMService) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const recNo = input.recNo;

    let result = null;
    try {
      result = await this.cfmService.update(`/tickets/${recNo}`, {
        data: { readFlag: 'Y' },
      });
    } catch (error) {
      return super.workerFailed({ error });
    }

    const output = { input, transactionId, result };
    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
