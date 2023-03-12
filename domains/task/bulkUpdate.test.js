import bulkWrite from './bulkUpdate'
import TaskRepository from '../../models/task.repository'

describe('Bulk update many with different update data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Should Bulk update with different data', () => {
    it('Call method filterAvailableStaffsByPriority with match one staff', async () => {
      const body = {
        input: [
          {
            _id: '5f07ec4f822bcd001b7622b3',
            sequenceSystem: 2
          },
          {
            _id: '5f07ec4f822bcd001b7622b4',
            sequenceSystem: 3
          }
        ]
      }
      TaskRepository.model.bulkWrite = jest.fn().mockResolvedValue({
        data: [
          {
            _id: 'taskIdMock',
            staffs: ['5f07ec4f822bcd001b7622b2', '5f07ec4f822bcd001b7622b1'],
          },
        ],
      })

      await bulkWrite(body)
      expect(TaskRepository.model.bulkWrite.call.length).toBe(1)
    })
  })
})
