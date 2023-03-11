// @flow
import { RestClient, IRestClient } from '../../libraries/client/restClient'
import config from '../../config/index'
import { validateData } from '../../utils/validate'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'

export type GenerateShortUrl = {
  url: string,
  tags?: 'cpfreshmart',
  data?: any,
  domain?: 'go.drivs.io',
  workspace?: 'ondemand',
}

export type GenerateShortUrlResponse = {
  statusCode: number, 
  status: string,  
  data: {
      generatedUrl: string,  
  },  

export interface IUrlShortenApiService {
    generateUrl(generateShortUrlParams: GenerateShortUrl): Promise<string>;
}

export class UrlShortenApiService implements IUrlShortenApiService {
  restClient: IRestClient

  constructor(restClient: IRestClient) {
    this.restClient = restClient
  }

  async generateUrl({
    url = '',
    tags = 'cpfreshmart',
    domain = 'go.drivs.io',
    workspace = 'ondemand',
    data = '',
  }: GenerateShortUrl): Promise<string> {
    const logMetadata = {
      event: 'generate_short_url',
      url,
      tags,
      domain,
      workspace,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      validateData({
        schema: {
          properties: {
            url: {
              type: 'string',
              format: 'uri',
            },
            tags: {
              type: 'string',
            },
            domain: {
              type: 'string',
            },
            workspace: {
              type: 'string',
            },
          },
          required: ['url', 'workspace'],
        },
        data: {
          url,
          tags,
          domain,
          workspace,
          data,
        },
      })

      const shortUrlResponse: GenerateShortUrlResponse = await this.restClient.post('/v1/url', {
        data: {
          url,
          tags,
          domain,
          workspace,
          data,
        },
      })

      const shortUrl = shortUrlResponse.data.generatedUrl

      logger.info(responseTime(logMetadata), shortUrl)
      return shortUrl
    } catch (err) {
      logger.error({ err, event: 'generate_short_url', url, tags, domain, workspace })
      throw err
    }
  }
}

export const urlShortenApiService = new UrlShortenApiService(
  new RestClient({
    baseURL: config.urlShorten.uri,
    headers: {
      Authorization: config.urlShorten.token,
    },
  }),
)
