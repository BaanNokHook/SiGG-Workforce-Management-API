// @flow
import * as R from 'ramda'
import axios from 'axios'
import { type Staff, type StaffsOrderTickets } from './type'
import config from '../../config/index'
import { RestClient, IRestClient } from '../../libraries/client/restClient'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'

const { routeHttp } = config
const { fleetUrl } = routeHttp

export interface IFleetApiService {
  getStaff(userIdOrStaffId: string): Promise<Staff>;  
  deleteStaffFromStaffOrderTicket(staffId: string, orderTicket: string): Promise<any>;   
  getStaffsOrderTicket(search: string): Promise<StaffsOrderTickets>;   
}  

export class FleetApiService implements IFleetApiService {
  restClient: IRestClient

  constructor(restClient: IRestClient) {
    this.restClient = restClient
  }

  async getAppointment(appointmentNo: string) {
    const response = await this.restClient.get(`/appointments/${appointmentNo}`)
    return response && response.data
  }

  async getTeam(teamId: string) {
    const response = await this.restClient.get(`/teams/${teamId}`)
    return response && response.data
  }

  async getStaff(userIdOrStaffId: string): Promise<Staff> {
    const response = await this.restClient.get(`/staff/${userIdOrStaffId}`)
    return response && response.data
  }

  async getStaffsOrderTicket(search: string): Promise<StaffsOrderTickets> {
    const logMetadata = {
      event: 'fleet_api_service_get_staff_order_ticket',
      search,
      logResponseTimeStart: new Date().getTime(),
    }

    const response = await this.restClient.get(`/staff/dispatch?${search}`)
    logger.info(responseTime(logMetadata))
    return response && response.data
  }

  async getAvailableByStaffCode(staffCode: string) {
    const response = await axios.get(`/support/wfm-available-staffs/${staffCode}`, {
      baseURL: fleetUrl,
    })

    return R.path(['data'], response)
  }

  async deleteStaffFromStaffOrderTicket(staffId: string, orderTicket: string) {
    const response = await this.restClient.delete(
      `/staff/dispatch/staff/${staffId}/ticket/${orderTicket}`,
      {},
    )
    return response && response.data
  }
}

export const fleetApiService = new FleetApiService(
  new RestClient({ baseURL: fleetUrl, headers: {} }),
)
