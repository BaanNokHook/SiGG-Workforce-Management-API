import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment';
import { Inject } from 'typedi';
import { CFMService } from '../../../services/cfm/cfm.service';
import { OmsService } from '../../../services/oms/oms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

export class WFM_UPDATE_META_INFORMATION extends MelonadeAbstraction {
  readonly taskName = 'wfm_update_meta_information';
  constructor(
    @Inject('OmsService') private omsService: OmsService,
    @Inject('CFMService') private cfmService: CFMService,
  ) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const orderId = input?.order?.orderId;

    const order = await this.omsService.get(`/v1/order/${orderId}`);
    const createTime = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');
    order.workflowInput.metaInformation.baseInformation.createTime = createTime;
    order.workflowInput.metaInformation.workOrderInformation.workOrderNumber =
      order.orderId;

    const update = {
      workflowInput: {
        ...order.workflowInput,
      },
    };

    await this.omsService.update(`/v1/order/${orderId}`, {
      data: update,
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

    const recNo = input.input.order.ticket.recNo;
    const orderId = input.input.order.orderId;

    try {
      const order = await this.omsService.get(`/v1/order/${orderId}`);

      const update = {
        deleted: true,
        orderStatuses: [
          ...order.orderStatuses,
          {
            status: 'WFM_CREATED_ORDER_FAIL',
            updatedAt: Date.now(),
          },
        ],
      };

      await this.omsService.update(`/v1/order/${orderId}`, {
        data: update,
      });

      await this.cfmService.update(`/tickets/${recNo}`, {
        data: { readFlag: 'N' },
      });
    } catch (error) {
      return super.workerCompleted({ error });
    }

    const output = { input, transactionId };

    return super.workerCompleted(output);
  }
}
