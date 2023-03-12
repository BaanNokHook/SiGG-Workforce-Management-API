import { Inject, Service } from 'typedi';
import { RestClient } from '../../libraries/client/restClient';

export interface IEchoResponse {
  headers: { [key: string]: string },
  path: string,
  query: { [key: string]: string },
}

@Service()
export class EchoService {
  private client: RestClient

  constructor(@Inject("config.ECHO_URL") baseURL: string) {
    this.client = new RestClient({
      baseURL
    })
  }

  doEcho(error: string = ''): Promise<IEchoResponse | null> {
    return this.client.get<IEchoResponse>('/echo', { params: { error } })
  }
}