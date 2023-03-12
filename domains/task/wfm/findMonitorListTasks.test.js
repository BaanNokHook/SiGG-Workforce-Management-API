import { wfmFindMonitorListTasks } from './findMonitorListTasks'
import TaskRepository from '../../../models/task.repository'
import TaskTypeRepository from '../../../models/taskType.repository'

describe('wfmFindMonitorListTasks', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find task successfully when query param are valid', async () => {
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
      taskTypeGroups: ['5fc5eacb12d7be00127e56a7'],
      staffs: [
        '5f7c4dfd948c8900245ea8a5',
        '5f7c4ec6948c8900245ea8fa',
        '5f7c503d948c8900245ea952',
        '5f7c50e7948c8900245ea9a7',
        '5f7c516b948c8900245ea9fc',
      ],
      projectId: '5cf0ad79b603c7605955bc7f',
      companyId: '5cee7a9bfc47036f05b13847',
      optional: {},
    }

    const findResults = [
      {
        staffs: [],
        status: 'FAILED',
        geographyId: '5fc600456bbc6600111e9529',
        priority: 0,
        _id: '5fc615bb12d7be00127e639b',
        information: {
          metaInformation: {
            baseInformation: {
              taskTypeName: 'Outsource FTTB-DSTV Fix Good Signal',
              deadline: '2020-12-02 05:41:55',
            },
          },
        },
        taskId: '108140733-201201341150',
      },
    ]

    const expectResults = [
      {
        staffs: [],
        status: 'FAILED',
        geographyId: '5fc600456bbc6600111e9529',
        priority: 0,
        _id: '5fc615bb12d7be00127e639b',
        information: {
          metaInformation: {
            baseInformation: {
              taskTypeName: 'Outsource FTTB-DSTV Fix Good Signal',
              deadline: '2020-12-02 05:41:55',
            },
          },
        },
        taskId: '108140733-201201341150',
      },
      {
        staffs: [],
        status: 'FAILED',
        geographyId: '5fc600456bbc6600111e9529',
        priority: 0,
        _id: '5fc615bb12d7be00127e639b',
        information: {
          metaInformation: {
            baseInformation: {
              taskTypeName: 'Outsource FTTB-DSTV Fix Good Signal',
              deadline: '2020-12-02 05:41:55',
            },
          },
        },
        taskId: '108140733-201201341150',
      },
      {
        staffs: [],
        status: 'FAILED',
        geographyId: '5fc600456bbc6600111e9529',
        priority: 0,
        _id: '5fc615bb12d7be00127e639b',
        information: {
          metaInformation: {
            baseInformation: {
              taskTypeName: 'Outsource FTTB-DSTV Fix Good Signal',
              deadline: '2020-12-02 05:41:55',
            },
          },
        },
        taskId: '108140733-201201341150',
      },
    ]

    TaskTypeRepository.model.find = jest.fn()
    const taskTypeRepositoryMock = TaskTypeRepository.model.find

    taskTypeRepositoryMock.mockImplementationOnce(
      jest.fn(() => {
        return {
          select: jest.fn().mockResolvedValue([{ _id: '1' }, { _id: '2' }]),
        }
      }),
    )

    TaskRepository.model.find = jest.fn()
    const taskRepositoryMock = TaskRepository.model.find

    taskRepositoryMock.mockImplementation(
      jest.fn(() => {
        return {
          populate: jest.fn(() => {
            return {
              sort: jest.fn(() => {
                return {
                  select: jest.fn(() => {
                    return {
                      limit: jest.fn(() => {
                        return {
                          lean: jest.fn().mockResolvedValue([
                            {
                              staffs: [],
                              status: 'FAILED',
                              geographyId: '5fc600456bbc6600111e9529',
                              priority: 0,
                              _id: '5fc615bb12d7be00127e639b',
                              information: {
                                metaInformation: {
                                  baseInformation: {
                                    taskTypeName: 'Outsource FTTB-DSTV Fix Good Signal',
                                    deadline: '2020-12-02 05:41:55',
                                  },
                                },
                              },
                              taskId: '108140733-201201341150',
                            },
                          ]),
                        }
                      }),
                    }
                  }),
                }
              }),
            }
          }),
        }
      }),
    )

    const tasks = await wfmFindMonitorListTasks(query)
    expect(tasks).toEqual(expectResults)
  })
})
