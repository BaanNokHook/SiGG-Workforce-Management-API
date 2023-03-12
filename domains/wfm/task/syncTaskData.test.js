import { SyncTaskData } from './syncTaskData'
import TaskRepository from '../../../models/task.repository'

describe('WFM sync and indexing missing tasks for search', () => {
  let taskMonitorListEsClient = {
    search: jest.fn(),
  }
  let validateIdsWithIndexingSource = jest.fn()

  TaskRepository.model.find = jest.fn()
  TaskRepository.model.updateMany = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  const syncTaskData = new SyncTaskData(taskMonitorListEsClient)
  const batchProcessParams = {
    startTime: null,
    offSetTime: null,
    companyId: 'cwfm12345',
    projectId: 'pwfm12345',
  }

  it('should validate and sync tasks correctly when have task data', async () => {
    const expectedExistsIds = '1234'
    const expectedMissingIds = '7777'

    taskMonitorListEsClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [
            {
              _id: expectedExistsIds,
            },
          ],
        },
      },
    })

    TaskRepository.model.find.mockImplementationOnce(
      jest.fn(() => {
        return {
          select: jest
            .fn()
            .mockResolvedValue([{ _id: expectedExistsIds }, { _id: expectedMissingIds }]),
        }
      }),
    )

    validateIdsWithIndexingSource.mockResolvedValue([expectedMissingIds])
    TaskRepository.model.updateMany.mockResolvedValue(null)
    const result = await syncTaskData.batchProcessReIndexing(batchProcessParams)
    expect(result).toEqual({ taskIdsToReIndex: [expectedMissingIds] })
  })

  it('should validate and sync tasks correctly when empty task data', async () => {
    const expectedExistsIds = []
    const expectedMissingIds = []

    taskMonitorListEsClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [
            {
              _id: expectedExistsIds,
            },
          ],
        },
      },
    })

    TaskRepository.model.find.mockImplementationOnce(
      jest.fn(() => {
        return {
          select: jest
            .fn()
            .mockResolvedValue([{ _id: expectedExistsIds }, { _id: expectedMissingIds }]),
        }
      }),
    )

    validateIdsWithIndexingSource.mockResolvedValue([expectedMissingIds])
    TaskRepository.model.updateMany.mockResolvedValue(null)
    const result = await syncTaskData.batchProcessReIndexing(batchProcessParams)
    expect(result).toEqual({ taskIdsToReIndex: [''] })
  })
})
