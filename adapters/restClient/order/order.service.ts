import { Inject, Service } from 'typedi';
import { STATUS_CODE } from '../../../api/rest/utils/responseHelper';
import { InternalError } from '../../../errors/errors';
import { RestClient } from '../../../libraries/client/restClient';
import { chunk } from '../../../utils/chunk';
import { IGetOrdersResponse, IInstallationOrder } from './type';

@Service('OrderService')
export class OrderService {
  private client: RestClient;

  constructor(@Inject('config.oms.OMS_URL') baseURL: string) {
    this.client = new RestClient({
      baseURL,
    });
  }

  async getOrderByOrderId<T>(orderId: string): Promise<T | undefined> {
    const queryCondition = {
      orderId: orderId,
    };
    const query = `?search=${JSON.stringify(queryCondition)}&limit=1`;
    const resp = await this.client.get<IGetOrdersResponse<T>>(
      `/v1/order${query}`,
    );

    return resp?.data?.data[0];
  }

  async getOrdersByZoneIds<T>(
    zoneIds: string[],
    date: string,
    chunkSize: number,
  ): Promise<T[]> {
    let resultOrders: T[] = [];
    let chunkZoneIds = chunk(zoneIds, chunkSize);

    for await (const zoneIds of chunkZoneIds) {
      const queryCondition = {
        $and: [
          {
            'workflowInput.projectId': '5cf0ad79b603c7605955bc7f',
          },
          {
            'workflowInput.zone._id': {
              $in: zoneIds,
            },
          },
          { 'workflowInput.appointment.appointmentDate': date },
          {
            currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
          },
        ],
      };
      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;

      const ordersResult = await this.client.get<IGetOrdersResponse<T>>(
        `/v1/order${query}`,
      );

      if (!ordersResult || !ordersResult.data) {
        continue;
      }

      resultOrders.push(...ordersResult.data.data);
    }

    return resultOrders;
  }

  async getOrderByIds<T>(orderIds: string[]): Promise<T[]> {
    const filterCondition = {
      orderId: {
        $in: orderIds,
      },
    };

    const query = `?search=${JSON.stringify(filterCondition)}&limit=5000`;

    const ordersResult = await this.client.get<IGetOrdersResponse<T>>(
      `/v1/order${query}`,
    );

    if (!ordersResult?.data?.data) {
      return [];
    }

    return ordersResult.data.data;
  }

  async getInstallationOrders(
    teamCodes: string[],
    installationDate: string,
    chunkSize: number,
    filters: any,
  ): Promise<IInstallationOrder[]> {
    const listTeamCodes = chunk(teamCodes, chunkSize);
    let resultInstallationOrders: IInstallationOrder[] = [];

    for await (const teamCodes of listTeamCodes) {
      const queryCondition = {
        $and: [
          {
            'workflowInput.projectId': '5cf0ad79b603c7605955bc7f',
          },
          {
            'workflowInput.metaInformation.installationInformation.installationDate': installationDate,
          },
          {
            'workflowInput.metaInformation.installationInformation.teamCode': {
              $in: teamCodes,
            },
          },
          {
            currentOrderStatus: 'WFM_WAIT_FOR_OPTIMIZE',
          },
          ...filters,
        ],
      };

      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
      const resp = await this.client.get<
        IGetOrdersResponse<IInstallationOrder>
      >(`/v1/order${query}`);

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(
          `unable get installation orders by date and teamCodes (${installationDate} / ${teamCodes}) [${resp.statusCodes}]`,
        );
      }

      if (!resp?.data?.data || resp?.data?.data.length === 0) {
        continue;
      }

      resultInstallationOrders.push(...resp?.data?.data);
    }

    return resultInstallationOrders;
  }
}
