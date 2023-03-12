import { TaskStates } from '@melonade/melonade-client'
import SetTaskSequenceSystemByTripIdWorker from './setTaskSequenceSystemByTrip.worker'
import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'

describe('Set task sequence system by trip id worker', () => {
  const setTaskSequenceSystemByTripIdWorker = new SetTaskSequenceSystemByTripIdWorker()
  describe('Process', () => {
    test('trip was delete', async () => {
      const task = {
        input: {
          tripId: '5f29506bd42f27001115e0d4',
        },
      }
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(null)
      const { status, output } = await setTaskSequenceSystemByTripIdWorker.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output).toEqual({
        message: 'Trip not found',
      })
    })

    test('bulk write failed', async () => {
      const task = {
        input: {
          tripId: '5f29506bd42f27001115e0d4',
        },
      }
      const findTripMock = {
        tasks: [
          {
            _id: '5f29506bd42f27001115e0d4',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d5',
            windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d6',
            windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
          },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      }
      const updateError = new Error('bulk write failed')
      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      taskRepository.update = jest.fn().mockRejectedValueOnce(updateError)
      const { status, output } = await setTaskSequenceSystemByTripIdWorker.process(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          message: '[Process] Set task sequence system by trip id failed',
          stack: updateError,
        },
      })
    })

    test('sort task and set sequence system of each task', async () => {
      const task = {
        input: {
          tripId: 'trip_0',
        },
      }
      const findTripMock = {
        tasks: [
          {
            _id: '5f29506bd42f27001115e0d4',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d5',
            windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d6',
            windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
          },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      }

      tripRepository.findOne = jest.fn().mockResolvedValueOnce(findTripMock)
      taskRepository.update = jest
        .fn()
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d4',
          sequenceSystem: 1,
          windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
        })
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d5',
          sequenceSystem: 2,
          windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
        })
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d6',
          sequenceSystem: 3,
          windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
        })

      const { status, output } = await setTaskSequenceSystemByTripIdWorker.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.previousTasks).toEqual(findTripMock.tasks)

      expect(taskRepository.update.mock.calls).toEqual([
        [{ _id: '5f29506bd42f27001115e0d4' }, { sequenceSystem: 1 }],
        [{ _id: '5f29506bd42f27001115e0d5' }, { sequenceSystem: 2 }],
        [{ _id: '5f29506bd42f27001115e0d6' }, { sequenceSystem: 3 }],
      ])
      expect(output.updatedTasksResult).toEqual([
        {
          _id: '5f29506bd42f27001115e0d4',
          sequenceSystem: 1,
          windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
        },
        {
          _id: '5f29506bd42f27001115e0d5',
          sequenceSystem: 2,
          windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
        },
        {
          _id: '5f29506bd42f27001115e0d6',
          sequenceSystem: 3,
          windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
        },
      ])
      expect(output.sortedTasks).toEqual([
        {
          _id: '5f29506bd42f27001115e0d4',
          windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          sequenceSystem: 1,
        },
        {
          _id: '5f29506bd42f27001115e0d5',
          windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          sequenceSystem: 2,
        },
        {
          _id: '5f29506bd42f27001115e0d6',
          windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
          sequenceSystem: 3,
        },
      ])
    })
  })

  describe('Compensate', () => {
    test('bulk write failed', async () => {
      const task = {
        input: {
          input: {
            tripId: '5f29506bd42f27001115e0d4',
          },
          output: {
            previousTasks: [
              {
                _id: '5f29506bd42f27001115e0d4',
                windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
              },
              {
                _id: '5f29506bd42f27001115e0d5',
                windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
              },
              {
                _id: '5f29506bd42f27001115e0d6',
                windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
              },
            ],
          },
        },
      }
      const updateError = new Error('bulk write failed')
      taskRepository.update = jest.fn().mockRejectedValueOnce(updateError)
      const { status, output } = await setTaskSequenceSystemByTripIdWorker.compensate(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          message: '[Compensate] Set task sequence system by trip id failed',
          stack: updateError,
        },
      })
    })

    test('sort task and set sequence system of each task', async () => {
      const task = {
        input: {
          input: {
            tripId: '5f29506bd42f27001115e0d4',
          },
          output: {
            previousTasks: [
              {
                _id: '5f29506bd42f27001115e0d4',
                windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
              },
              {
                _id: '5f29506bd42f27001115e0d5',
                windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
              },
              {
                _id: '5f29506bd42f27001115e0d6',
                windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
              },
            ],
          },
        },
      }

      taskRepository.update = jest
        .fn()
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d4',
          windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          sequenceSystem: null,
        })
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d5',
          windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          sequenceSystem: null,
        })
        .mockResolvedValueOnce({
          _id: '5f29506bd42f27001115e0d6',
          windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
          sequenceSystem: null,
        })
      const { status, output } = await setTaskSequenceSystemByTripIdWorker.compensate(task)
      expect(status).toBe(TaskStates.Completed)
      expect(taskRepository.update.mock.calls).toEqual([
        [{ _id: '5f29506bd42f27001115e0d4' }, { sequenceSystem: undefined }],
        [{ _id: '5f29506bd42f27001115e0d5' }, { sequenceSystem: undefined }],
        [{ _id: '5f29506bd42f27001115e0d6' }, { sequenceSystem: undefined }],
      ])
      expect(output.updatedTasksResult).toEqual([
        {
          _id: '5f29506bd42f27001115e0d4',
          windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          sequenceSystem: null,
        },
        {
          _id: '5f29506bd42f27001115e0d5',
          windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          sequenceSystem: null,
        },
        {
          _id: '5f29506bd42f27001115e0d6',
          windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T16:00:00.000Z'],
          sequenceSystem: null,
        },
      ])
    })
  })
})
