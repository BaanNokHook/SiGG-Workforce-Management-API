// @flow
import { type ISmsApiService } from '../adapters/restClient/sms'
import { type IUrlShortenApiService } from '../adapters/restClient/urlShorten'
import { SmsWorker } from './sendSms.worker'
import { type ITaskRepo } from '../models/implementations/taskRepo'
import {
  todoSetoffTaskDeliveryOperationUpdate,
  todoDeliveredTaskDeliveryOperationUpdate,
} from './sendSms.worker.mock'

const SmsApiService: ISmsApiService = {
  sendSms: jest.fn(),
}

const UrlShortenApiService: IUrlShortenApiService = {
  generateUrl: jest.fn(),
}

const TaskRepo: ITaskRepo = {
  getTaskById: jest.fn(),
}

const mockConfig = {
  bootstrapServers: 'localhost:9092',
  consumerGroupId: 'test-group',
  topic: 'test',
}

describe('SendSmsWorker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should set config correctly', () => {
    const worker = new SmsWorker(
      mockConfig,
      'https://web.tracking',
      SmsApiService,
      UrlShortenApiService,
      TaskRepo,
    )
    expect(worker.config).toBe(mockConfig)
  })

  it('Should send sms to recipient', async () => {
    const worker = new SmsWorker(
      mockConfig,
      'https://web.tracking/1',
      SmsApiService,
      UrlShortenApiService,
      TaskRepo,
    )

    TaskRepo.getTaskById.mockResolvedValue({
      tripId: {
        metadata: {
          orderId: 'ODM-orderId',
        },
      },
      information: {
        phone: '0889942500',
      },
    })

    UrlShortenApiService.generateUrl.mockResolvedValue('https://go.drivs.io/9lDaoP')

    await worker.onMessage({ value: todoSetoffTaskDeliveryOperationUpdate })

    expect(SmsApiService.sendSms).toHaveBeenCalled()
  })

  it('Should not send sms to recipient', async () => {
    const worker = new SmsWorker(
      mockConfig,
      'https://web.tracking/1',
      SmsApiService,
      UrlShortenApiService,
      TaskRepo,
    )

    await worker.onMessage({ value: todoDeliveredTaskDeliveryOperationUpdate })

    expect(SmsApiService.sendSms).not.toHaveBeenCalled()
  })
})
