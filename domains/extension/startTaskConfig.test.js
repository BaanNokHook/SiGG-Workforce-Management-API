import startTaskConfig from './startTaskConfig'
jest.mock('../../utils/domain')
jest.mock('../../config')
import { checkFindOne, checkFind } from '../../utils/domain'
import config from '../../config'
import { TaskStatus } from '../../constants/task'
import taskRepository from '../../models/task.repository'

describe('Start Task Config', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('WFM Assurance with PRIORITY', () => {
    config.wfm.PROJECT_ID.ASSURANCE = 'projectId_mock'
    it('should return true, when task is high priority', async () => {
      checkFindOne.mockResolvedValue({
        _id: '_id_mock',
        sequenceSystem: 2,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
        priority: 3,
      })

      const result = await startTaskConfig('taskId')
      expect(result).toEqual(true)
    })

    it('should return true, when task is not high priority and no require task in this trip', async () => {
      checkFindOne.mockResolvedValue({
        _id: '_id_mock',
        sequenceSystem: 3,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
        priority: 1,
      })

      checkFind.mockResolvedValue([])
      const result = await startTaskConfig('taskId')
      expect(result).toEqual(true)
    })

    it('should return false, when task is not high priority and there is some require task in this trip', async () => {
      checkFindOne.mockResolvedValue({
        _id: '_id_mock',
        sequenceSystem: 3,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        information: { metaInformation: { baseInformation: { createUser: 'TRUE-CFM' } } },
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      checkFind.mockResolvedValue([{ _id: 'task_id' }])
      const result = await startTaskConfig('taskId')
      expect(result).toEqual(false)
    })

    it('should throw error, when function checkFindOne error', async () => {
      checkFindOne.mockRejectedValue(new Error('Something Error'))
      await expect(startTaskConfig('taskId')).rejects.toThrowError(`Something Error`)
    })

    it('should throw error, when function checkFind error', async () => {
      checkFindOne.mockResolvedValue({
        _id: '_id_mock',
        sequenceSystem: 3,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        information: { metaInformation: { baseInformation: { createUser: 'TRUE-CFM' } } },
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      checkFind.mockRejectedValue(new Error('Something Error'))
      await expect(startTaskConfig('taskId')).rejects.toThrowError(`Something Error`)
    })
  })

  describe('Start task by SEQUENTIAL Strategy', () => {
    it('should return true, when the previous task is not DONE', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([])

      const result = await startTaskConfig('taskId')
      expect(result).toEqual(true)
    })

    it('should return false, when the previous task is DONE', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([
        {
          _id: 'taskId',
          status: TaskStatus.DOING,
        },
        {
          _id: 'taskId',
          status: TaskStatus.PENDING,
        },
      ])

      const result = await startTaskConfig('taskId')
      expect(result).toEqual(false)
    })

    it('test query params', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([])

      await startTaskConfig('taskId')

      expect(checkFind).toBeCalledWith(taskRepository, {
        isRequired: true,
        sequenceSystem: {
          $lt: 1,
        },
        status: {
          $in: [TaskStatus.PENDING, TaskStatus.TODO, TaskStatus.DOING],
        },
        tripId: 'tripId_mock',
      })
    })
  })

  describe('Start task by SEQUENTIAL_IN_SAME_ORDER_TYPE Strategy', () => {
    it('should return true, when the previous task is not DONE', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL_IN_SAME_ORDER_TYPE',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([])

      const result = await startTaskConfig('taskId')
      expect(result).toEqual(true)
    })

    it('should return false, when the previous task is DONE', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL_IN_SAME_ORDER_TYPE',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([
        {
          _id: 'taskId',
          status: TaskStatus.DOING,
        },
        {
          _id: 'taskId',
          status: TaskStatus.PENDING,
        },
      ])

      const result = await startTaskConfig('taskId')
      expect(result).toEqual(false)
    })

    it('test query params', async () => {
      //get task
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        sequenceSystem: 1,
        tripId: 'tripId_mock',
        status: TaskStatus.TODO,
        taskId: 'taskId_mock',
        projectId: 'projectId_mock',
        information: {
          orderType: {
            key: 'ORDER_TYPE_MOCK'
          }
        }
      })

      //get todo : set off
      checkFindOne.mockResolvedValueOnce({
        _id: '_id_mock',
        taskId: 'taskId',
        status: TaskStatus.TODO,
        isStart: true,
        metadata: {
          startTaskStrategy: 'SEQUENTIAL_IN_SAME_ORDER_TYPE',
        },
      })

      //get previous tasks not done
      checkFind.mockResolvedValueOnce([])

      await startTaskConfig('taskId')

      expect(checkFind).toBeCalledWith(taskRepository, {
        isRequired: true,
        sequenceSystem: {
          $lt: 1,
        },
        status: {
          $in: [TaskStatus.PENDING, TaskStatus.TODO, TaskStatus.DOING],
        },
        tripId: 'tripId_mock',
        'information.orderType.key': 'ORDER_TYPE_MOCK'
      })
    })
  })
})
