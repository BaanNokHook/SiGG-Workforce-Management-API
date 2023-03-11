// @flow
import axios from 'axios'
import { RestClient, IRestClient, ResponseError } from '../../libraries/client/restClient'
import config from '../../config/index'
import logger from '../../libraries/logger'

const { routeHttp } = config
const { dispatchUrl } = routeHttp


export interface Rule { 
   name: string;  
   description: string; 
   schema: string;  
   condition: string; 
   filter: string; 
   limit: number;
   outputKey: string;  
}

export interface Score {
  name: string;
  description: string;
  condition: string;
  expression: string;
  outputKey: string;
}

export interface Dispatch {
  size: number;
  strategy: string;
  fallbackStrategy: string;
  lock: boolean;
  batchSize: number;
  batchTimeout: number;
  resetLimit: number;
  timeout: number;
}

export interface Flow {
  name: string;
  description: string;
  schema: string;
  rules: Rule[];
  scores: Score[];
  dispatch: Dispatch;
  companyId: string;
  projectId: string;
  createdAt: Date;
}

export interface VehicleType {
  height: number;
  length: number;
  name: string;
  weight: number;
  width: number;
}

export interface Data {
  _id: string;
  description: string;
  isInternalService: boolean;
  name: string;
  priority: number;
  projectId: string;
  timeout: number;
  vehicleTypes: VehicleType[];
}

export interface Candidate {
  status: string;
  token: string;
  tokenExpiredAt: string;
  data: Data;
}

export interface TicketSink {
  melonadeTransactionId: string;
  melonadeTaskId: string;
}

export interface Payload {}

export type TicketStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED'
export interface Ticket {
  flow: Flow;
  ticketId: string;
  status: TicketStatus;
  candidates: Candidate[];
  ticketSink: TicketSink;
  createdAt: string;
  startedAt: string;
  completedAt: Date;
  resetCount: number;
  payload: Payload;
}

export interface IDispatchApiService {
  getTicket(ticketId: string): Promise<any>;
  updateTicket(ticketId: string, token: string): Promise<Ticket>;
}

export class DispatchApiService implements IDispatchApiService {
  restClient: IRestClient

  constructor(restClient: IRestClient) {
    this.restClient = restClient
  }

  async getTicket(ticketId: string): Promise<any> {
    const startTime = new Date()
    try {
      const response = await this.restClient.get(`/v1/ticket/${ticketId}`)
      const responseTime = new Date() - startTime
      logger.info({
        event: 'dispatch_get_ticket',
        ticketId,
        status: response.data.status,
        responseTime,
      })
      return response && response.data
    } catch (err) {
      const errorResponseTime = new Date() - startTime
      logger.error({ err, event: 'dispatch_get_ticket', ticketId, responseTime: errorResponseTime })
      if (err instanceof ResponseError) {
        const message: string = err.data.error
        if (message && message.startsWith('NoResult')) {
          return null
        }
      }
      throw err
    }
  }

  async updateTicket(ticketId: string, token: string): Promise<Ticket> {
    const startTime = new Date()
    const data = { ticketId, token, status: 'ACCEPTED' }
    try {
      const response = await this.restClient.put('/v1/ticket', { data })

      const responseTime = new Date() - startTime

      logger.info(
        {
          event: 'dispatch_update_ticket',
          ticketId,
          token,
          responseTime,
        },
        data,
      )
      return response && response.data
    } catch (err) {
      const errorResponseTime = new Date() - startTime
      console.log('DISPATCH_UPDATE_TICKET::', err)
      logger.error(
        { err, event: 'dispatch_update_ticket', ticketId, token, responseTime: errorResponseTime },
        data,
      )
      throw err
    }
  }
}

export const dispatchApiService = new DispatchApiService(
  new RestClient({
    baseURL: dispatchUrl,
    headers: {
      'accept-encoding': 'gzip',
    },
  }),
)
