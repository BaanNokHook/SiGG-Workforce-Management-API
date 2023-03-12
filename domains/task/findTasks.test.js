import { Types } from 'mongoose'
import { generateFilter, findTasks } from './findTasks'
import TaskRepository from '../../models/task.repository'

describe('generateFilter', () => {
  describe('filter object', () => {
    test('if query is empty, it should be empty', () => {
      const query = {}
      const filter = generateFilter(query)

      expect(filter).toEqual({})
    })

    test('if startTime and endTime are defined, it should have windowTime.0 and windowTime.1 with correct values', () => {
      const query = {
        startTime: '2020-11-11T00:00:00.000Z',
        endTime: '2020-11-10T00:00:00.000Z',
      }
      const filter = generateFilter(query)

      expect(filter).toEqual({
        'windowTime.0': { $gte: new Date('2020-11-11T00:00:00.000Z') },
        'windowTime.1': { $lt: new Date('2020-11-10T00:00:00.000Z') },
      })
    })

    test('if staffs is defined and staffs is not empty, it should have staffs property with correct value', () => {
      const query = { staffs: ['5f7c4dfd948c8900245ea8a5'] }
      const filter = generateFilter(query)

      expect(filter).toEqual({ staffs: { $in: [Types.ObjectId('5f7c4dfd948c8900245ea8a5')] } })
    })

    test('if companyId and projectId are defined, it should have companyId and projectId properties with correct values', () => {
      const query = { companyId: '5cee7a9bfc47036f05b13847', projectId: '5cf0ad79b603c7605955bc7f' }
      const filter = generateFilter(query)

      expect(filter).toEqual({
        companyId: Types.ObjectId('5cee7a9bfc47036f05b13847'),
        projectId: Types.ObjectId('5cf0ad79b603c7605955bc7f'),
      })
    })
  })
})

describe('findTasks', () => {
  test('find tasks complete', async () => {
    TaskRepository.aggregatePaginate = jest
      .fn()
      .mockResolvedValueOnce({ data: { data: [{ _id: 'task_0' }] } })

    const query = {
      startTime: '2020-11-11T00:00:00.000Z',
      endTime: '2020-11-12T00:00:00.000Z',
      staffs: ['5f7c4dfd948c8900245ea8a5'],
      taskTypeGroup: '5fc5eacb12d7be00127e569e',
      optional: {
        'information.prodId': '1405487',
      },
    }

    const options = {
      populate: [{ path: 'todos', select: '_id' }],
      select: '_id',
      limit: 10,
      page: 1,
      sort: { _id: -1 },
    }

    const tasks = await findTasks(query, options)
    expect(tasks).toEqual({ data: { data: [{ _id: 'task_0' }] } })
  })

  test('should convert string/array to object correctly', async () => {
    TaskRepository.aggregatePaginate = jest
      .fn()
      .mockResolvedValueOnce({ data: { data: [{ _id: 'task_0' }] } })

    const query = {
      startTime: '2020-11-11T00:00:00.000Z',
      endTime: '2020-11-12T00:00:00.000Z',
      staffs: ['5f7c4dfd948c8900245ea8a5'],
      taskTypeGroup: '5fc5eacb12d7be00127e569e',
      optional: {
        $and: [
          { teamId: { $in: ['5fc5eacb12d7be00127e569f'] } },
          { teamId: '5fc5eacb12d7be00127e569f' },
        ],
      },
      convertOptionalObjectId: [
        { path: ['$and', 0, 'teamId', '$in'] },
        { path: ['$and', 1, 'teamId'] },
        { path: ['mock', 1, 'mock'] },
      ],
    }

    const tasks = await findTasks(query, {})
    expect(TaskRepository.aggregatePaginate).toBeCalledWith(
      [
        {
          $match: {
            $and: [
              { teamId: { $in: [Types.ObjectId('5fc5eacb12d7be00127e569f')] } },
              { teamId: Types.ObjectId('5fc5eacb12d7be00127e569f') },
            ],
            deleted: false,
            staffs: { $in: [Types.ObjectId('5f7c4dfd948c8900245ea8a5')] },
            'windowTime.0': { $gte: new Date('2020-11-11T00:00:00.000Z') },
            'windowTime.1': { $lt: new Date('2020-11-12T00:00:00.000Z') },
          },
        },
      ],
      { limit: 10, page: 1 },
    )
    expect(tasks).toEqual({ data: { data: [{ _id: 'task_0' }] } })
  })
})
