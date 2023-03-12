import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { Inject } from 'typedi';
import { SccdResultCode } from '../../../services/sccd/interface';
import { SccdService } from '../../../services/sccd/sccd.service';
import { TmsService } from '../../../services/tms/tms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_SCCD_RETURN_BACK_WORK_ORDER_WORKER extends MelonadeAbstraction {
  readonly taskName = 'wfm_sccd_return_back_work_order';

  constructor(
    @Inject('TmsService') private tmsService: TmsService,
    @Inject('SccdService') private sccdService: SccdService,
  ) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input } = task;
    const { request } = input;

    const taskId = request.metadata?.task?._id;

    let sccdTask;
    try {
      const taskResp = await this.tmsService.getTaskById(taskId);
      sccdTask = taskResp?.data;
    } catch (error) {
      const message = 'Error while get sccd task.';
      return this.workerFailed({
        message,
        taskId,
        error,
      });
    }

    if (!sccdTask) {
      const message = 'Task not found.';
      return this.workerFailed({
        message,
        taskId,
      });
    }

    const payload = {
      userId: sccdTask.information.userId,
      userName: sccdTask.information.userName,
      systemId: sccdTask.information.systemId,
      operDate: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
      reason: request.metadata.reason?.item?.name ?? '-',
      workorderNo: sccdTask.information.woList?.[0]?.workorderNo,
      remark: request.comments?.messages ?? '-',
    };

    let response;
    try {
      response = await this.sccdService.returnBackWorkOrder(payload);
    } catch (error) {
      const message = 'Error while return back work order.';
      return this.workerFailed({
        message,
        payload,
        error,
      });
    }

    const output = {
      isSuccess: response?.resultCode === SccdResultCode.E00,
      payload,
      response,
    };

    return this.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return this.workerCompleted(output);
  }
}
