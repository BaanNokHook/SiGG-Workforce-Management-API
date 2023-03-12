import { TriggerTripsStatusToWeomniEarns } from './triggerTripsStatusToWeomniEarns.worker'
import { fleetApiService } from '../../adapters/restClient/fleet'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { addressDirectionDomain } from '../../domains/address/getAddressDirection'
import { weomniApiService } from '../../adapters/restClient/weomni'
import { mockTripData } from '../../domains/trip/updateDirection.mock'
import config from '../../config'

const taskRepo: ITaskRepo = {
  getTaskByIds: jest.fn(),
}
const tripRepo: ITripRepo = {
  update: jest.fn(),
}

jest.mock('../../config')
jest.mock('../../adapters/restClient/fleet')
jest.mock('../../domains/address/getAddressDirection')
jest.mock('../../adapters/restClient/weomni')

const mockConfig = {
  bootstrapServers: 'localhost:9092',
  consumerGroupId: 'test-group',
  topic: 'test',
}

function buildMockTripsStatus() {
  return {
    value: {
      fullDocument: mockTripData,
      operationType: 'update',
      updateDescription: {
        updatedFields: {
          status: 'DONE',
        },
      },
    },
  }
}

describe('Set Trips monitor status to weomni earns-bulk worker', () => {
  const worker = new TriggerTripsStatusToWeomniEarns(mockConfig)

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should success Trip status "DONE" worker trigger to weomni earns-bulk', () => {
    config.weomni.driver.crmChannel = 'TMS'
    fleetApiService.getStaff.mockResolvedValueOnce({ userId: 'userId_mock' })

    taskRepo.getTaskByIds.mockResolvedValue({ staffs: ['staff_id'] })
    addressDirectionDomain.calculateEarn.mockResolvedValueOnce({ TRIP: 1, DROP: 1, DISTANCE: 1 })
    weomniApiService.earnsBulk.mockResolvedValueOnce(true)
    tripRepo.update.mockResolvedValue(true)

    worker.onMessage(buildMockTripsStatus())
  })
})
