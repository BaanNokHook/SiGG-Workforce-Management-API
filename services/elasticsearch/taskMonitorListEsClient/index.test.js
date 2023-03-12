import { mockClear } from 'jest-mock-extended'
import { TaskMonitorListEsClient } from '.'
import { Client } from '@elastic/elasticsearch'

jest.mock('@elastic/elasticsearch')

describe('taskMonitorListEsClient', () => {
  let mockCreate = jest.fn()
  let mockExists = jest.fn()
  let mockIndex = jest.fn()

  beforeEach(() => {
    mockCreate.mockClear()
    mockExists.mockClear()
    mockIndex.mockClear()
    Client.mockImplementation(() => {
      return {
        index: mockIndex,
        indices: {
          exists: mockExists,
          create: mockCreate,
        },
      }
    })
  })

  test('should create index when not exists', async () => {
    mockExists.mockResolvedValueOnce({ body: false })
    mockCreate.mockResolvedValueOnce({})

    const mockClient = new TaskMonitorListEsClient()

    expect(mockClient).toBeDefined()
    expect(mockExists).toHaveBeenCalled()
    process.nextTick(async () => {
      await expect(mockCreate).toHaveBeenCalled()
    })
  })

  test('should not create index when exists', async () => {
    mockExists.mockResolvedValueOnce({ body: true })
    mockCreate.mockResolvedValueOnce({})

    const mockClient = new TaskMonitorListEsClient()

    expect(mockClient).toBeDefined()
    expect(mockExists).toHaveBeenCalled()
    process.nextTick(async () => {
      await expect(mockCreate).not.toHaveBeenCalled()
    })
  })
})
