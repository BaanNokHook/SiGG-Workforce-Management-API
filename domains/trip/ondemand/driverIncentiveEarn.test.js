// @flow
import { driverIncentiveEarn } from './driverIncentiveEarn'
import { fleetApiService } from '../../../adapters/restClient/fleet'
import { TaskRepo } from '../../../models/implementations/taskRepo'
import { weomniApiService } from '../../../adapters/restClient/weomni'
import { addressDirectionDomain } from '../../../domains/address/getAddressDirection'
import { mockTripData } from '../../../domains/trip/updateDirection.mock'
import config from '../../../config'

jest.mock('../../../config')
jest.mock('../../../adapters/restClient/fleet')
jest.mock('../../../adapters/restClient/weomni')
jest.mock('../../../domains/address/getAddressDirection')

describe('driverIncentiveEarn', () => {
  const taskRepo = new TaskRepo()
  const getTaskByIdsSpy = jest.spyOn(taskRepo, 'getTaskByIds')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should success get earn from address-and-zone calculate send to weomni earns-bulk', async () => {
    config.weomni.driver.crmChannel = 'TMS'
    fleetApiService.getStaff.mockResolvedValueOnce({ userId: 'userId_mock' })

    getTaskByIdsSpy.mockResolvedValueOnce({ staffs: ['staff_id'] })
    addressDirectionDomain.calculateEarn.mockResolvedValueOnce({ TRIP: 1, DROP: 1, DISTANCE: 1 })
    weomniApiService.earnsBulk.mockResolvedValueOnce(true)

    await driverIncentiveEarn(mockTripData)
    expect(weomniApiService.earnsBulk).toHaveBeenCalled()
  })
})
