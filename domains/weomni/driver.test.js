// @flow
import config from '../../config'
import { WeomniDriver } from './driver'
import { weomniApiService } from '../../adapters/restClient/weomni'

jest.mock('../../config')
jest.mock('../../adapters/restClient/weomni')

describe('weomni driver domain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const weomniDriver = new WeomniDriver()

  it('should success earns-bulk to weomni', async () => {
    weomniApiService.earnsBulk.mockResolvedValue(true)

    await weomniDriver.earnsBulk([
      {
        orderRef: 'orderRef_mock',
        channel: 'channel_mock',
        token: { TRIP: 1, DROP: 1, KM: 1 },
        username: 'username_mock',
      },
    ])

    expect(weomniApiService.earnsBulk).toHaveBeenCalled()
  })
})
