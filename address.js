// @flow
import * as R from 'ramda'
import config from '../../config/index'
import { RestClient, IRestClient } from '../../libraries/client/restClient'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'

const { routeHttp } = config
const { addressUrl } = routeHttp


type Mode = 'motorcycle' | 'car'

export type AddressDirection = {
  engine?: string,
  wayPoints: string,
  mode?: Mode | string,
}

export class AddressApiService {
  restClient: IRestClient

  constructor(restClient: IRestClient) {
    this.restClient = restClient
  }

  async getConfigGeographiesByAreaCodes(areaCodes: string[]) {
    const query = {
      'metadata.areaCode': { $in: areaCodes },
      'metadata.isFromCustomer': false,
      deleted: false,
    }
    const response = await this.restClient.get(`/geographies?search=${JSON.stringify(query)}`)
    return R.pathOr([], ['data', 'data'], response)
  }

  async getDirection(request: AddressDirection): Promise<any> {
    const logMetadata = {
      event: 'address_get_direction',
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const params = new URLSearchParams(request).toString()
      const response = await this.restClient.get(`/direction?${params}`)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(request))
      throw err
    }
  }
}

export const addressApiService = new AddressApiService(
  new RestClient({ baseURL: addressUrl, headers: {} }),
)
