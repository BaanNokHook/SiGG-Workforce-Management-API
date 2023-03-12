import { findSLASummary } from './findSLASummary'
import TaskRepository from '../../../models/task.repository'

describe('findSLASummary', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find sla summary successfully when query param are valid', async () => {
    const query = {
      startTime: '2020-10-19T00:00:00.000Z',
      endTime: '2020-10-20T00:00:00.000Z',
      areaCodes: [
        '103202040903',
        '103202040901',
        '103202040902',
        '103202040904',
        '103202040904',
        '103202040904',
        '103202040904',
        '103202040904',
      ],
      staffs: [
        '5f7c4dfd948c8900245ea8a5',
        '5f7c4ec6948c8900245ea8fa',
        '5f7c503d948c8900245ea952',
        '5f7c50e7948c8900245ea9a7',
        '5f7c516b948c8900245ea9fc',
      ],
      projectId: '5cf0ad79b603c7605955bc7f',
      companyId: '5cee7a9bfc47036f05b13847',
    }
    TaskRepository.model.find = jest.fn()
    const taskRepositoryMock = TaskRepository.model.find
    const getAssignedTaskTimeOutStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(10),
        }
      }),
    )
    const getAssignedTaskWarningStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(5),
        }
      }),
    )
    const getAssignedTaskNormalStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(1),
        }
      }),
    )
    const getUnassignedTaskTimeOutStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(5),
        }
      }),
    )
    const getUnassignedTaskWarningStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(0),
        }
      }),
    )
    const getUnassignedTaskNormalStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(0),
        }
      }),
    )

    const getClosedTaskTimeOutStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(3),
        }
      }),
    )
    const getClosedTaskWarningStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(0),
        }
      }),
    )
    const getClosedTaskNormalStatus = taskRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          count: jest.fn().mockResolvedValueOnce(1),
        }
      }),
    )

    const summary = await findSLASummary(query)
    expect(summary).toEqual({
      assigned: {
        timeout: 10,
        warning: 5,
        normal: 1,
      },
      unassigned: {
        timeout: 5,
        warning: 0,
        normal: 0,
      },
      cancelled: {
        timeout: 3,
        warning: 0,
        normal: 1,
      },
      summary: {
        timeout: 18,
        warning: 5,
        normal: 2,
      },
    })
  })
})
