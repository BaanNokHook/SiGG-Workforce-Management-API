import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { UpdateTechnicianInTaskDomain } from '../../../domains/installation/updateTechnicianInTask.domain';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_UPDATE_STAFF_TO_QURN extends MelonadeAbstraction {
  readonly taskName = 'wfm_update_staff_to_qrun';

  constructor(
    @Inject('UpdateTechnicianInTaskDomain') private updateTechnicianInTaskService: UpdateTechnicianInTaskDomain,
  ) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { order, originalOrders } = input;
    const { tasks } = order;

    const resps = [];
    for await (const installationTask of tasks) {
      try {
        const resp = await this.updateTechnicianInTaskService.updateTechnicianInTask(
          installationTask.staffs[0],
          installationTask.orderId,
          false,
        );

        resps.push(resp);
      } catch (error) {
        this.logger.error(
          error,
          {
            event: 'UPDATE-INSTALLATION-STAFF-TO-QRUN',
          },
          'UPDATE-INSTALLATION-STAFF-TO-QRUN process error, orderId: ' +
          installationTask.orderId,
        );

        return await this.rollbackOriginalOrders(originalOrders);
      }
    }

    return super.workerCompleted({
      transactionId,
      resp: resps,
    });
  }

  private async rollbackOriginalOrders(originalOrders: any) {
    for await (const originalOrder of originalOrders) {
      try {
        await this.updateTechnicianInTaskService.updateTechnicianInTask(
          originalOrder.staffId,
          originalOrder.orderId,
          true,
        );
      } catch (error) {
        this.logger.error(
          error,
          {
            event: 'UPDATE-INSTALLATION-STAFF-TO-QRUN',
          },
          'UPDATE-INSTALLATION-STAFF-TO-QRUN rollbackOriginalOrders process error, orderId: ' +
          originalOrder.orderId,
        );
      }
    }

    return super.workerFailed({
      message: 'Can not updateTechnicianInTaskService.',
    });
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input } = task;
    const { originalOrders } = input;

    return await this.rollbackOriginalOrders(originalOrders);
  }
}