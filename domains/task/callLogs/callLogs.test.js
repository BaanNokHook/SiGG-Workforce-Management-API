import { CallLogsDomain } from './callLogs.domain'
import ThrowError from '../../../error/basic'
import bulkPush from '../bulkPush'

jest.mock('../bulkPush')

describe('CallLogsDomain', () => {
  const taskRepo = {
    getTaskById: jest.fn(),
    update: jest.fn(),
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  const callLogsDomain = new CallLogsDomain(taskRepo)

  test('should save callLogs correctly', async () => {
    taskRepo.getTaskById.mockResolvedValue({
      _id: 'mockTaskId',
      metadata: {},
    })

    bulkPush.mockResolvedValue({})

    const mockCallLogs = [
      {
        taskId: 'mockTaskId',
        destinationNumber: '0991112222',
        duration: 1,
        startCall: new Date(),
        type: 'UNDEFINED',
      },
    ]

    expect(async () => await callLogsDomain.save(mockCallLogs)).not.toThrow()
  })

  test('should be error when data is invalid', async () => {
    const mockInput = {}
    await expect(callLogsDomain.save(mockInput)).rejects.toEqual(
      ThrowError.FIELD_IS_INVALID('data must be array with at least one element.'),
    )
  })

  test('should be error when function bulkPush was rejected', async () => {
    const mockCallLogs = [
      {
        taskId: 'mockTaskId',
        destinationNumber: '0991112222',
        duration: 1,
        startCall: new Date(),
        type: 'UNDEFINED',
      },
    ]

    bulkPush.mockRejectedValue(new Error('Error'))

    await expect(callLogsDomain.save(mockCallLogs)).rejects.toThrowError('Error')
  })
})
