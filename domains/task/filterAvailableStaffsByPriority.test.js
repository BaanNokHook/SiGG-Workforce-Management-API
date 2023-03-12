import { filterAvailableStaffsByPriority } from './filterAvailableStaffsByPriority'
import TaskRepository from '../../models/task.repository'

describe('Filter Available Staff Domain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Should get filter staff available', () => {
    it('Call method filterAvailableStaffsByPriority with match one staff', async () => {
      const staffIds = [
        '5f07ec4f822bcd001b7622b2',
        '5f07ec4f822bcd001b7622b1',
        '5f07ec4f822bcd001b7622b0',
      ]
      const priority = 4
      const windowTime = ['2020-08-02T12:00:00.000Z', '2020-08-05T12:30:00.000Z']
      const projectId = '5cf0ad79b603c7605955bc7f'
      TaskRepository.find = jest.fn().mockResolvedValue({
        data: [
          {
            _id: 'taskIdMock',
            staffs: ['5f07ec4f822bcd001b7622b2', '5f07ec4f822bcd001b7622b1'],
          },
        ],
      })
      const resp = await filterAvailableStaffsByPriority(staffIds, priority, windowTime, projectId)
      expect(TaskRepository.find.call.length).toBe(1)
      expect(resp.staffIds).toEqual(['5f07ec4f822bcd001b7622b0'])
    })

    it('Call method filterAvailableStaffsByPriority with all staff unavailable', async () => {
      const staffIds = ['5f07ec4f822bcd001b7622b1', '5f07ec4f822bcd001b7622b0']
      const priority = 4
      const windowTime = ['2020-08-02T12:00:00.000Z', '2020-08-05T12:30:00.000Z']
      const projectId = '5cf0ad79b603c7605955bc7f'
      TaskRepository.find = jest.fn().mockResolvedValue({
        data: [
          {
            _id: 'taskIdMock',
            staffs: ['5f07ec4f822bcd001b7622b1', '5f07ec4f822bcd001b7622b0'],
          },
        ],
      })
      const resp = await filterAvailableStaffsByPriority(staffIds, priority, windowTime, projectId)
      expect(TaskRepository.find.call.length).toBe(1)
      expect(resp.staffIds).toEqual([])
    })

    it('Call method filterAvailableStaffsByPriority with all staff available', async () => {
      const staffIds = [
        '5f07ec4f822bcd001b7622b1',
        '5f07ec4f822bcd001b7622b0',
        '5f07ec4f822bcd001b7622b2',
      ]
      const priority = 4
      const windowTime = ['2020-08-02T12:00:00.000Z', '2020-08-05T12:30:00.000Z']
      const projectId = '5cf0ad79b603c7605955bc7f'
      TaskRepository.find = jest.fn().mockResolvedValue({
        data: [
          {
            _id: 'taskIdMock',
            staffs: [],
          },
        ],
      })
      const resp = await filterAvailableStaffsByPriority(staffIds, priority, windowTime, projectId)
      expect(TaskRepository.find.call.length).toBe(1)
      expect(resp.staffIds).toEqual([
        '5f07ec4f822bcd001b7622b1',
        '5f07ec4f822bcd001b7622b0',
        '5f07ec4f822bcd001b7622b2',
      ])
    })

    it('Call method filterAvailableStaffsByPriority with windowTime not matched', async () => {
      const staffIds = [
        '5f07ec4f822bcd001b7622b1',
        '5f07ec4f822bcd001b7622b0',
        '5f07ec4f822bcd001b7622b2',
      ]
      const priority = 4
      const windowTime = ['2020-08-02T12:00:00.000Z', '2020-08-05T12:30:00.000Z']
      const projectId = '5cf0ad79b603c7605955bc7f'
      TaskRepository.find = jest.fn().mockResolvedValue({
        data: [
          {
            _id: 'taskIdMock1',
            staffs: ['5f07ec4f822bcd001b7622b0'],
            windowTime: ['2020-08-03T12:00:00.000Z', '2020-08-04T12:00:00.000Z'],
          },
          {
            _id: 'taskIdMock2',
            staffs: ['5f07ec4f822bcd001b7622b1'],
            windowTime: ['2020-08-04T12:00:00.000Z', '2020-08-05T12:00:00.000Z'],
          },
          {
            _id: 'taskIdMock3',
            staffs: ['5f07ec4f822bcd001b7622b2'],
            windowTime: ['2020-08-04T10:00:00.000Z', '2020-08-04T12:00:00.000Z'],
          },
        ],
      })
      const resp = await filterAvailableStaffsByPriority(staffIds, priority, windowTime, projectId)
      expect(TaskRepository.find.call.length).toBe(1)
      expect(resp.staffIds).toEqual([])
    })
  })
})
