import { AutoAssignDomain } from './autoAssignTask'
import { TaskRepo } from '../../models/implementations/taskRepo'
import { TripRepo } from '../../models/implementations/tripRepo'
import { OsrmGatewayDomain } from '../address/osrmGatewayDomain'
import {
  mockDataAssignedAt07AMForTask06,
  mockDataAssignedAt07AMForTask723,
  mockDataMustNotAssignAtMidnight,
  mockDataQA,
  mockDataQANotBehindCurrentTime,
  mockDataQAWarranty,
  mockDataQR,
  mockDataTomorrowTask,
} from './autoAssignTask.mock'
import { AssignedTaskRepo } from '../../models/implementations/assignedTaskRepo'

describe('AutoAssign domain', () => {
  const tripRepo = new TripRepo()
  const tripRepoGetTripByStaffIdOnCurrentDateSpy = jest.spyOn(
    tripRepo,
    'getTripByStaffIdOnCurrentDate',
  )

  const taskRepo = new TaskRepo()
  const taskRepoGetUnassignedTasksFromTaskPoolSpy = jest.spyOn(
    taskRepo,
    'getUnassignedTasksFromTaskPool',
  )

  const assignedTaskRepo = new AssignedTaskRepo()
  const assignedTaskRepoGetAssignedTasksSpy = jest.spyOn(assignedTaskRepo, 'getAssignedTasks')
  const assignedTaskRepoCreateAssignedTasksSpy = jest.spyOn(assignedTaskRepo, 'createAssignedTasks')

  const osrmGateway = new OsrmGatewayDomain()
  const osrmGatewayDistanceMatrixSpy = jest.spyOn(osrmGateway, 'distanceMatrix')

  beforeEach(() => {
    tripRepoGetTripByStaffIdOnCurrentDateSpy.mockClear()
    taskRepoGetUnassignedTasksFromTaskPoolSpy.mockClear()
    assignedTaskRepoGetAssignedTasksSpy.mockClear()
    assignedTaskRepoCreateAssignedTasksSpy.mockClear()
    osrmGatewayDistanceMatrixSpy.mockClear()
  })

  const domain = new AutoAssignDomain(tripRepo, taskRepo, assignedTaskRepo, osrmGateway)

  describe('auto assignTask', async () => {
    test('assigned qr task', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(mockDataQR.tripResp)
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(mockDataQR.taskPoolsResp)
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(mockDataQR.distanceMatrixResp)
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataQR.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-08-31T03:00:50.000Z',
            assignTask: {
              task: 't2',
              windowTime: {
                start: '2020-08-31T04:00:00.000Z',
                end: '2020-08-31T05:00:00.000Z',
              },
              travelTime: {
                previousTaskToAssignTask: 8.889999999999999,
                assignTaskToNextTask: 0,
                workTime: 30,
                total: 38.89,
              },
            },
          },
        ],
        unassignedTasks: ['t1'],
      }

      expect(got).toEqual(want)
    })

    test('assigned qa task', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(mockDataQA.tripResp)
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(mockDataQA.taskPoolsResp)
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(mockDataQA.distanceMatrixResp)
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataQA.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-08-31T03:00:50.000Z',
            assignTask: {
              task: 't3',
              windowTime: {
                start: '2020-08-31T11:00:00.000Z',
                end: '2020-08-31T12:00:00.000Z',
              },
              travelTime: {
                previousTaskToAssignTask: 6.493333333333334,
                assignTaskToNextTask: 0,
                workTime: 30,
                total: 36.49333333333333,
              },
            },
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test('assigned with tomorrow task', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(mockDataTomorrowTask.tripResp)
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(
        mockDataTomorrowTask.taskPoolsResp,
      )
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(mockDataTomorrowTask.distanceMatrixResp)
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataTomorrowTask.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-08-31T03:00:50.000Z',
            assignTask: {
              task: 't1',
              windowTime: {
                start: '2020-08-31T04:00:00.000Z',
                end: '2020-08-31T05:00:00.000Z',
              },
              travelTime: {
                previousTaskToAssignTask: 6.118333333333334,
                assignTaskToNextTask: 0,
                workTime: 30,
                total: 36.11833333333333,
              },
            },
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test('not assign cause duplicate task in cache', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(mockDataQR.tripResp)
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(mockDataQR.taskPoolsResp)
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(mockDataQR.distanceMatrixResp)
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue(['t2'])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataQR.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-08-31T03:00:50.000Z',
          },
        ],
        unassignedTasks: ["t1"],
      }

      expect(got).toEqual(want)
    })

    test('assigned qa not behind current time', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(
        mockDataQANotBehindCurrentTime.tripResp,
      )
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(
        mockDataQANotBehindCurrentTime.taskPoolsResp,
      )
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(
        mockDataQANotBehindCurrentTime.distanceMatrixResp,
      )
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataQANotBehindCurrentTime.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-12-15T10:31:33.121Z',
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test('assigned task at 0-7AM for task 0-6', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask06.tripResp,
      )
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask06.taskPoolsResp,
      )
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask06.distanceMatrixResp,
      )
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataAssignedAt07AMForTask06.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-12-14T17:00:00.000Z',
            assignTask: {
              task: 't3',
              windowTime: {
                start: '2020-12-14T22:00:00.000Z',
                end: '2020-12-14T23:00:00.000Z',
              },
              travelTime: {
                previousTaskToAssignTask: 2.175,
                assignTaskToNextTask: 0,
                workTime: 30,
                total: 32.175,
              },
            },
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test('assigned task at 0-7AM for task 7-23', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask723.tripResp,
      )
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask723.taskPoolsResp,
      )
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(
        mockDataAssignedAt07AMForTask723.distanceMatrixResp,
      )
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataAssignedAt07AMForTask723.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-12-14T17:00:00.000Z',
            assignTask: {
              task: 't3',
              windowTime: {
                start: '2020-12-15T00:00:00.000Z',
                end: '2020-12-15T01:00:00.000Z',
              },
              travelTime: {
                previousTaskToAssignTask: 2.175,
                assignTaskToNextTask: 0,
                workTime: 30,
                total: 32.175,
              },
            },
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test('must not assign on midnight 23:00-23:59', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(
        mockDataMustNotAssignAtMidnight.tripResp,
      )
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(
        mockDataMustNotAssignAtMidnight.taskPoolsResp,
      )
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(
        mockDataMustNotAssignAtMidnight.distanceMatrixResp,
      )
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataMustNotAssignAtMidnight.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-12-15T16:00:00.000Z',
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })

    test(`convertToTaskLocation should return default location when it doesn't has.`, async () => {
      const tasks = [
        {
          information: {
            metaInformation: {
              orderBaseInformation: {
                location: {
                  latitude: '1',
                  longitude: '2',
                },
              },
            },
          },
        },
        {},
      ]

      const got = domain.convertToTaskLocation(tasks)
      const want = [
        [1, 2],
        [13.68429, 100.61095],
      ]

      expect(got).toEqual(want)
    })

    test('assigned qa warranty task', async () => {
      tripRepoGetTripByStaffIdOnCurrentDateSpy.mockResolvedValue(mockDataQAWarranty.tripResp)
      taskRepoGetUnassignedTasksFromTaskPoolSpy.mockResolvedValue(mockDataQAWarranty.taskPoolsResp)
      osrmGatewayDistanceMatrixSpy.mockResolvedValue(mockDataQAWarranty.distanceMatrixResp)
      assignedTaskRepoGetAssignedTasksSpy.mockResolvedValue([])
      assignedTaskRepoCreateAssignedTasksSpy.mockResolvedValue([])

      const got = await domain.assignTask(mockDataQAWarranty.input)
      const want = {
        assignTasks: [
          {
            tripId: 'tripId',
            staffId: 'staff1',
            dateTime: '2020-08-31T03:00:50.000Z',
          },
        ],
        unassignedTasks: [],
      }

      expect(got).toEqual(want)
    })
  })
})
