import { Inject, Service } from 'typedi';
import { RestClient } from '../../../libraries/client/restClient';
import { ILogger } from '../../../libraries/logger/logger.interface';
import { consoleLogger } from '../../../logger';
import {
  IRequest,
  IRequestApproveService,
  IRequestParam,
  IRequestType,
  IResponse,
} from './reqeustApprove.interface';

@Service('RequestApproveService')
export class RequestApproveService implements IRequestApproveService {
  private client: RestClient;

  constructor(
    @Inject('config.requestApprove.REQUEST_BASE_URL')
    baseURL: string,

    @Inject('logger')
    private logger: ILogger = consoleLogger,
  ) {
    this.client = new RestClient({ baseURL });
  }

  async getReqeusts(requestParams: IRequestParam): Promise<IRequest[]> {
    try {
      const response = await this.client.get<IResponse<IRequest[]>>(
        '/v1/requests',
        {
          params: requestParams,
        },
      );

      return response?.data || ([] as IRequest[]);
    } catch (e) {
      this.logger.error(e, {
        event: 'GET_REQUESTS',
        requestParams,
      });

      throw e;
    }
  }

  async getRequestTypes(): Promise<IRequestType[]> {
    try {
      const requestTypes = await this.client.get<IRequestType[]>(
        '/v1/request-types',
      );

      return requestTypes || ([] as IRequestType[]);
    } catch (e) {
      this.logger.error(e, {
        event: 'GET_REQUEST_TYPES',
      });

      throw e;
    }
  }
}
