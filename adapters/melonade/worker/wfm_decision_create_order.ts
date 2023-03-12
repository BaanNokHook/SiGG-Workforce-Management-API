import {
  ITask as IMelonadeTask,
  ITaskResponse
} from '@melonade/melonade-client';
import { Service } from 'typedi';
import { TmsService } from '../../../services/tms/tms.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

interface IServiceOrderAttribute {
  attrCode: string,
  value: string,
}

interface IProductOrderList {
  prodEventCode: string
  product: {
    prodSpecCode: string
  }
}

interface ISerivceOrderInformation {
  basedProdSpec?: string
  serviceOrderAttribute?: IServiceOrderAttribute[]
  productOrderList?: IProductOrderList[]
}

interface ITask {
  taskType: string;
  taskTypeCode: string;
  information: {
    metaInformation?: {
      installationInformation?: {
        serviceOrderInfo?: ISerivceOrderInformation
      }
    }
  }
}

interface TaskTypeDSLAMConfig {
  basedProd: string
  prodEventCodes: string[]
  serviceOrderAttrs: string[]
  zone: string;
  assignTo: [string];
  appointment: {
    type: "appointment" | "deadline"
    value: string
    unit: "day" | "minute"
  }
  [key: string]: any;
}

interface IDSLAMConfig {
  [key: string]: TaskTypeDSLAMConfig[]
}

interface ITask extends IMelonadeTask {
  input: {
    DSLAMConfig: IDSLAMConfig;
    order: {
      tasks: ITask[];
    };
  };
}

const CHANGE_TYPE_PREFIX = 'CHANGE'
const CHANGE_TYPE_VALUE = 'Y'

@Service()
export class WFM_DECISION_CREATE_ORDER extends MelonadeAbstraction {
  readonly taskName = 'wfm_decision_create_order';

  constructor(private tmsService: TmsService) {
    super();
  }

  async process({ input }: ITask): Promise<ITaskResponse> {
    const { DSLAMConfig, order } = input;
    const { taskType, taskTypeCode, information } = order.tasks?.[0] || ({} as ITask);

    const taskTypeConfigs = DSLAMConfig[taskTypeCode];
    if (!taskTypeConfigs) {
      return this.workerCompleted({
        assignTo: 'SUB',
        sub: {
          taskTypeId: taskType,
          taskTypeCode: taskTypeCode,
        }
      });
    }

    const serviceOrderInfo = information?.metaInformation?.installationInformation?.serviceOrderInfo
    const baseProdCode = this.getBaseProdSpec(serviceOrderInfo)
    try {
      for (const taskTypeConfig of taskTypeConfigs) {
        const serviceOrderAttrs = this.filterChangeTypeOrderAttrs(serviceOrderInfo?.serviceOrderAttribute || [])
        const prodOrderList = this.filterChangeTypeProdOrders(serviceOrderInfo?.productOrderList || [])
        const taskTypeValidator = this.validateBaseProdAndChangeType(
          taskTypeConfig, baseProdCode, serviceOrderAttrs, prodOrderList)
        if (!taskTypeValidator) continue

        const taskTypeDecision = await this.prepareDSLAMPayload(taskTypeValidator, taskType, taskTypeCode)

        return this.workerCompleted(taskTypeDecision);
      }
    } catch (err) {
      return this.workerFailed(err);
    }

    return this.workerCompleted({
      assignTo: 'SUB',
      sub: {
        taskTypeId: taskType,
        taskTypeCode: taskTypeCode,
      }
    });
  }

  async compensate(_: IMelonadeTask): Promise<ITaskResponse> {
    return this.workerCompleted({ message: 'nothing to compensate.' });
  }

  private getBaseProdSpec(svcOrderInfo?: ISerivceOrderInformation): string {
    return svcOrderInfo?.basedProdSpec || ''
  }

  private filterChangeTypeOrderAttrs(orderAttrs: IServiceOrderAttribute[]): IServiceOrderAttribute[] {
    return orderAttrs.filter(attr => attr.attrCode.startsWith(CHANGE_TYPE_PREFIX) && attr.value === CHANGE_TYPE_VALUE)
  }

  private filterChangeTypeProdOrders(prodOrders: IProductOrderList[]): IProductOrderList[] {
    return prodOrders.filter(order => order.prodEventCode.startsWith(CHANGE_TYPE_PREFIX))
  }

  private validateBaseProdAndChangeType(
    taskTypeConfig: TaskTypeDSLAMConfig,
    baseProdCode: string,
    serviceOrderAttrs: IServiceOrderAttribute[],
    prdOrderList: IProductOrderList[]): TaskTypeDSLAMConfig | undefined {

    const configProdEventSize = taskTypeConfig.prodEventCodes.length
    const configSvcOrderSize = taskTypeConfig.serviceOrderAttrs.length
    const prodEventSize = prdOrderList.length
    const svcOrderSize = serviceOrderAttrs.length
    const isBaseProdCodeMatched = taskTypeConfig.basedProd === baseProdCode

    if (
      configProdEventSize === 0 && configSvcOrderSize === 0 &&
      prodEventSize === 0 && svcOrderSize === 0 &&
      isBaseProdCodeMatched
    ) return taskTypeConfig

    if (
      configProdEventSize !== prodEventSize ||
      configSvcOrderSize !== svcOrderSize ||
      !isBaseProdCodeMatched
    ) return undefined

    const svcOrderAttrValidator = (el: string) => serviceOrderAttrs.some((attr) => attr.attrCode === el)
    const prdOrderListValidator = (el: string) => prdOrderList.some((prd) => prd.prodEventCode === el)
    const isAllProdEventExists = taskTypeConfig.prodEventCodes.every((ec) => prdOrderListValidator(ec))
    const isAllOrderAttrExsits = taskTypeConfig.serviceOrderAttrs.every((so) => svcOrderAttrValidator(so))
    return isBaseProdCodeMatched &&
      isAllProdEventExists &&
      isAllOrderAttrExsits ? taskTypeConfig : undefined
  }

  private async prepareDSLAMPayload(taskTypeConfig: TaskTypeDSLAMConfig, taskType: string, taskTypeCode: string) {
    const { assignTo } = taskTypeConfig;
    const taskTypeCodeDict = assignTo?.reduce((acc, cur) => {
      if (cur === 'sub') {
        return acc;
      }

      return {
        ...acc,
        [cur]: taskTypeConfig[cur],
      };
    }, {} as { [key: string]: string });

    try {
      const taskTypes = await Promise.all(
        Object.values(taskTypeCodeDict).map((code) =>
          this.tmsService.getTaskTypeByCode(code),
        ),
      );

      const taskTypeDict = taskTypes?.reduce(
        (acc, { taskTypeCode, taskTypeId, taskTypeGroupId, durationAsMinutes }) => ({
          ...acc,
          [taskTypeCode]: taskTypeId,
          [`${taskTypeCode}_duration`]: durationAsMinutes,
          [`${taskTypeCode}_group`]: taskTypeGroupId,
        }),
        {} as { [key: string]: string | number },
      );

      const mapOutput =
        Object.entries(taskTypeCodeDict)?.reduce(
          (acc, [key, code]) => ({
            ...acc,
            [key]: {
              taskTypeId: taskTypeDict[code],
              taskTypeCode: code,
              taskTypeGroupId: taskTypeDict[`${code}_group`],
              durationAsMinutes: taskTypeDict[`${code}_duration`],
            }
          }),
          {} as { [key: string]: object },
        ) || {};

      return {
        assignTo: assignTo?.sort()?.join('_')?.toUpperCase(),
        appointmentType: taskTypeConfig.appointment,
        sub: {
          taskTypeId: taskType,
          taskTypeCode: taskTypeCode,
        },
        ...mapOutput,
      }
    } catch (e) {
      throw {
        error: e.stack,
        data: e.data,
      }
    }
  }
}
