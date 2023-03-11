// @flow
import { AddressApiService } from './address'
import { addressResponse } from './address.mock'
import { IRestClient } from '../../libraries/client/restClient'
import config from '../../config'

jest.mock('../../config')

const RestClient: IRestClient = {
  get: jest.fn(),
}

describe('Address api service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should success sent request to url direction api service method "GET"', async () => {
    RestClient.get.mockResolvedValue(addressResponse)
    const addressApiService = new AddressApiService(RestClient, 'true')
    await addressApiService.getDirection({
      engine: 'engine_mock',
      wayPoints: 'wayPoints_mock',
      mode: 'motorcycle',
    })

    expect(RestClient.get).toHaveBeenCalled()
  })
})
