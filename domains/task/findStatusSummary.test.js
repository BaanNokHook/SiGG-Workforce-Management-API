import { Types } from 'mongoose'
import { generateFilter, findStatusSummary } from './findStatusSummary'
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
      const query = { staffs: ['5d856ff05554f8003ac27439'] }
      const filter = generateFilter(query)

      expect(filter).toEqual({ staffs: { $in: [Types.ObjectId('5d856ff05554f8003ac27439')] } })
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

describe('findStatusSummary', () => {
  test('find status summary complete', async () => {
    const mockReturnSummary = [
      {
        status: 'OK',
        statusCode: 200,
        data: {
          task: [
            {
              _id: 'CANCELED',
              total: 3,
            },
            {
              _id: 'DONE',
              total: 25,
            },
            {
              _id: 'DOING',
              total: 25,
            },
            {
              _id: 'TODO',
              total: 49,
            },
            {
              _id: 'PENDING',
              total: 15,
            },
            {
              _id: 'FAILED',
              total: 1,
            },
          ],
          todo: [
            {
              _id: 'SET_OFF',
              title: {
                th: 'SET OFF',
              },
              actualTotal: 25,
              total: 2,
            },
            {
              _id: 'CHANGE_PORT',
              title: {
                th: 'Change Port',
              },
              actualTotal: 3,
              total: 3,
            },
            {
              _id: 'ENTER_SITE',
              title: {
                th: 'ENTER SITE',
              },
              actualTotal: 22,
              total: 4,
            },
            {
              _id: 'E2E',
              title: {
                th: 'E2E',
              },
              actualTotal: 11,
              total: 11,
            },
            {
              _id: 'SWAP_ICC',
              title: {
                th: 'SWAP ICC',
              },
              actualTotal: 2,
              total: 2,
            },
            {
              _id: 'INSTALL_NEW_DEVICE',
              title: {
                th: 'Install new device',
              },
              actualTotal: 1,
              total: 1,
            },
            {
              _id: 'TAKE_A_PHOTO',
              title: {
                th: 'Take a photo',
              },
              actualTotal: 6,
              total: 6,
            },
            {
              _id: 'E_SIGNATURE',
              title: {
                th: 'E-signature',
              },
              actualTotal: 11,
              total: 11,
            },
          ],
        },
      },
    ]

    TaskRepository.aggregate = jest.fn().mockResolvedValueOnce(mockReturnSummary)
    const query = {
      startTime: '2020-10-01T00:00:00.000Z',
      endTime: '2020-10-09T23:59:59.999Z',
    }
    const options = {
      limit: 1000,
      page: 1,
    }
    const tasks = await findStatusSummary(query, options)
    expect(tasks).toEqual(mockReturnSummary[0])
  })
})
