// @flow
import logger from '../../libraries/logger'
import responseTime from '../../libraries/logger/responseTime'
import { ValidateError } from '../../constants/error'
import { weomniApiService, type earnsBulk } from '../../adapters/restClient/weomni'

export interface IWeomniDriver {
  earnsBulk(request: earnsBulk[]): Promise<any>;
}

export class WeomniDriver {
  async earnsBulk(request: earnsBulk[]): Promise<any> {
    const logMetadata = {
      event: 'weomni_driver_earns_bulk',
      orderRef: request.map((input) => input.orderRef),
      username: request.map((input) => input.username),
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      const response = await weomniApiService.earnsBulk(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))

      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify({ request }))
      throw err
    }
  }
}
