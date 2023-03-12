import { ITask, TaskStates } from '@melonade/melonade-client'
import RemoveTaskFromTripWorker from './removeTaskFromTrip.worker'
import tripRepository from '../../models/trip.repository'

describe('Remove task from trip worker', () => {
  const removeTaskFromTripWorker = new RemoveTaskFromTripWorker()
  describe('Process', () => {
    test('should delete trip when task out of trip (trip has 1 task)', async () => {
      const task = {
        input: {
          taskId: 'task_0',
          tripId: 'trip_0',
        },
      }

      const findTripMock = {
        tasks: [
          { _id: 'task_0', windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'] },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      tripRepository.delete = jest.fn()
      const { status, output } = await removeTaskFromTripWorker.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.wasTripDeleted).toBe(true)
      expect(output.previousTrip).toEqual(findTripMock)
    })

    test('should failed when not found task in trip', async () => {
      const task = {
        input: {
          taskId: 'task_0',
          tripId: 'trip_0',
        },
      }

      const findTripMock = {
        tasks: [
          { _id: 'task_1', windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'] },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      tripRepository.delete = jest.fn()
      const { status, output } = await removeTaskFromTripWorker.process(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output.error.message).toEqual('Task not found in this trip')
    })

    test('remove task from trip (trip has 2 tasks)', async () => {
      const task = {
        input: {
          taskId: 'task_1',
          tripId: 'trip_0',
        },
      }
      const findTripMock = {
        status: 'DOING',
        tasks: [
          {
            _id: 'task_0',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
            status: 'DONE',
          },
          {
            _id: 'task_1',
            windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
            status: 'DOING',
          },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T15:00:00.000Z'],
      }

      const updateTripMock = {
        tasks: ['task_0'],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
        status: 'DONE',
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      tripRepository.update = jest.fn().mockResolvedValueOnce(updateTripMock)
      const { status, output } = await removeTaskFromTripWorker.process(task)

      expect(status).toBe(TaskStates.Completed)
      expect(output.wasTripDeleted).toBe(false)
      expect(output.previousTrip).toEqual(findTripMock)
      expect(output.updatedTrip).toEqual(updateTripMock)
      expect(output.updatedData).toEqual({
        tasks: updateTripMock.tasks,
        windowTime: updateTripMock.windowTime,
        status: updateTripMock.status,
      })
    })

    test('remove task from trip (trip has 3 tasks)', async () => {
      const task = {
        input: {
          taskId: 'task_1',
          tripId: 'trip_0',
        },
      }
      const findTripMock = {
        tasks: [
          {
            _id: 'task_0',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
            isRequired: true,
          },
          {
            _id: 'task_1',
            windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
            isRequired: true,
          },
          {
            _id: 'task_2',
            windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
            isRequired: true,
          },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      }

      const updateTripMock = {
        tasks: ['task_0', 'task_2'],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      tripRepository.update = jest.fn().mockResolvedValueOnce(updateTripMock)
      const { status, output } = await removeTaskFromTripWorker.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.wasTripDeleted).toBe(false)
      expect(output.previousTrip).toEqual(findTripMock)
      expect(output.updatedTrip).toEqual(updateTripMock)
      expect(output.updatedData).toEqual({
        tasks: updateTripMock.tasks,
        windowTime: updateTripMock.windowTime,
      })
    })

    test('should set trip to done when left tasks have been done (trip has 4 tasks)', async () => {
      const task = {
        input: {
          taskId: 'task_3',
          tripId: 'trip_0',
        },
      }
      const findTripMock = {
        status: 'DOING',
        tasks: [
          {
            _id: 'task_0',
            windowTime: ['2020-09-10T10:00:00.000Z', '2020-09-10T11:00:00.000Z'],
            status: 'DONE',
          },
          {
            _id: 'task_1',
            windowTime: ['2020-09-10T11:00:00.000Z', '2020-09-10T12:00:00.000Z'],
            status: 'DONE',
          },
          {
            _id: 'task_2',
            windowTime: ['2020-09-10T12:00:00.000Z', '2020-09-10T13:00:00.000Z'],
            status: 'DONE',
          },
          {
            _id: 'task_3',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
            status: 'TODO',
          },
        ],
        windowTime: ['2020-09-10T10:00:00.000Z', '2020-09-10T14:00:00.000Z'],
      }

      const updateTripMock = {
        tasks: ['task_0', 'task_1', 'task_2'],
        status: 'DONE',
        windowTime: ['2020-09-10T10:00:00.000Z', '2020-09-10T13:00:00.000Z'],
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      tripRepository.update = jest.fn().mockResolvedValueOnce(updateTripMock)
      const { status, output } = await removeTaskFromTripWorker.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.wasTripDeleted).toBe(false)
      expect(output.previousTrip).toEqual(findTripMock)
      expect(output.updatedTrip).toEqual(updateTripMock)
      expect(output.updatedData).toEqual({
        tasks: updateTripMock.tasks,
        status: updateTripMock.status,
        windowTime: updateTripMock.windowTime,
      })
    })

    test('get trip by id failed', async () => {
      const task = {
        input: {
          taskId: 'task_1',
          tripId: 'trip_0',
        },
      }
      const findTripMock = {
        error: 'some_error',
      }
      tripRepository.findOne = jest.fn().mockRejectedValueOnce(findTripMock)
      const { status, output } = await removeTaskFromTripWorker.process(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          tripId: 'trip_0',
          stack: findTripMock,
        },
      })
    })
  })

  describe('Compensate', () => {
    test('should restore trip when trip has been deleted', async () => {
      const task = {
        input: {
          input: {
            taskId: 'task_1',
            tripId: 'trip_0',
          },
          output: {
            wasTripDeleted: true,
            previousTrip: {
              tasks: ['task_0'],
              windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
            },
          },
        },
      }

      const restoreTripMock = {
        n: 1,
        nModified: 1,
        ok: 1,
      }
      tripRepository.model.restore = jest.fn().mockResolvedValueOnce(restoreTripMock)
      const { status, output } = await removeTaskFromTripWorker.compensate(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output).toEqual({
        message: 'Restore trip complete',
        restoredTripResult: restoreTripMock,
      })
    })

    test('restore task to trip', async () => {
      const task = {
        input: {
          input: {
            taskId: 'task_1',
            tripId: 'trip_0',
          },
          output: {
            wasTripDeleted: false,
            previousTrip: {
              tasks: [{ _id: 'task_0' }, { _id: 'task_1' }],
              status: 'DOING',
              windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T15:00:00.000Z'],
            },
          },
        },
      }

      const updateTripMock = {
        tasks: ['task_0', 'task_1'],
        status: 'DOING',
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T15:00:00.000Z'],
      }
      tripRepository.update = jest.fn().mockResolvedValueOnce(updateTripMock)
      const { status, output } = await removeTaskFromTripWorker.compensate(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output).toEqual({
        updatedTrip: updateTripMock,
        updatedData: {
          tasks: updateTripMock.tasks,
          status: updateTripMock.status,
          windowTime: updateTripMock.windowTime,
        },
      })
    })

    test('restore trip failed', async () => {
      const task = {
        input: {
          input: {
            taskId: 'task_1',
            tripId: 'trip_0',
          },
          output: {
            wasTripDeleted: true,
            previousTrip: {
              tasks: ['task_0', 'task_1'],
              status: 'DOING',
              windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T15:00:00.000Z'],
            },
          },
        },
      }

      const restoredTripMock = {
        error: 'some_error',
      }
      tripRepository.model.restore = jest.fn().mockRejectedValueOnce(restoredTripMock)
      const { status, output } = await removeTaskFromTripWorker.compensate(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          tripId: 'trip_0',
          stack: restoredTripMock,
        },
      })
    })
  })
})
