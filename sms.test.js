// @flow
import { SmsApiService } from './sms'
import { smsResponse } from './sms.mock'
import { IRestClient } from '../../libraries/client/restClient'
import { ValidateError } from '../../constants/error'

const RestClient: IRestClient = {
  post: jest.fn(),
}

describe('SMS api service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should sent request to url shorten api service method "POST"', async () => {
    RestClient.post.mockResolvedValue(smsResponse)
    const smsApiService = new SmsApiService(RestClient, 'true')
    await smsApiService.sendSms({
      senderTitle: 'test',
      destinationNumber: '0889942560',
      sourceNumber: '0889942560',
      message: 'test sent sms',
    })
    expect(RestClient.post).toHaveBeenCalled()
  })

  it('Should throw ValidateError', async () => {
    expect.assertions(1)
    try {
      const smsApiService = new SmsApiService(RestClient, 'true')
      await smsApiService.sendSms({
        senderTitle: 1111,
        destinationNumber: '0889942560',
        message: 'test sent sms',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })
})
