import { ITask, TaskStates } from '@melonade/melonade-client'
import ReorderTaskSequenceInTrip from './reorderTaskSequenceInTrip.worker'
import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'

describe('sort task sequence in trip by tripId worker', () => {
  const reorderTaskSequenceInTrip = new ReorderTaskSequenceInTrip()
  describe('Process', () => {
    test('tripId was delete', async () => {
      const task = {
        input: {
          tripId: '5f29506bd42f27001115e0d4',
        },
      }
      tripRepository.model.findOne = jest.fn()
      const tripRepositoryMock = tripRepository.model.findOne

      tripRepositoryMock.mockImplementation(
        jest.fn(() => {
          return {
            populate: jest.fn(() => {
              return {
                select: jest.fn(() => {
                  return {
                    lean: jest.fn().mockResolvedValue(null),
                  }
                }),
              }
            }),
          }
        }),
      )
      const { status, output } = await reorderTaskSequenceInTrip.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output).toEqual({
        message: 'Trip not found',
      })
    })

    test('sort task and set sequence system of each task', async () => {
      const task = {
        input: {
          tripId: '5f29506bd42f27001115e0d4',
        },
      }
      tripRepository.model.findOne = jest.fn()
      const tripRepositoryMock = tripRepository.model.findOne
      const previousMock = {
        tasks: [
          {
            _id: '5f29506bd42f27001115e0d6',
            windowTime: ['2020-09-10T15:00:00.000Z', '2020-09-10T17:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d4',
            windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T14:00:00.000Z'],
          },
          {
            _id: '5f29506bd42f27001115e0d5',
            windowTime: ['2020-09-10T14:00:00.000Z', '2020-09-10T15:00:00.000Z'],
          },
        ],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      }

      tripRepositoryMock.mockImplementation(
        jest.fn(() => {
          return {
            populate: jest.fn(() => {
              return {
                select: jest.fn(() => {
                  return {
                    lean: jest.fn().mockResolvedValue(previousMock),
                  }
                }),
              }
            }),
          }
        }),
      )

      tripRepository.model.update = jest.fn().mockResolvedValueOnce({})
      const { status, output } = await reorderTaskSequenceInTrip.process(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.previousTrip).toEqual({
        tasks: ['5f29506bd42f27001115e0d6', '5f29506bd42f27001115e0d4', '5f29506bd42f27001115e0d5'],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T16:00:00.000Z'],
      })
      expect(output.sortResult).toEqual({
        tasks: ['5f29506bd42f27001115e0d4', '5f29506bd42f27001115e0d5', '5f29506bd42f27001115e0d6'],
        windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T17:00:00.000Z'],
      })
    })
  })

  describe('Compensate', () => {
    test('update failed', async () => {
      const task = {
        input: {
          input: {
            tripId: '5f29506bd42f27001115e0d4',
          },
          output: {
            previousTrip: {
              tasks: [
                '5f29506bd42f27001115e0d4',
                '5f29506bd42f27001115e0d5',
                '5f29506bd42f27001115e0d6',
              ],
              windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T17:00:00.000Z'],
            },
          },
        },
      }
      const updateMock = {
        error: 'update failed',
      }
      tripRepository.model.update = jest.fn().mockRejectedValueOnce(updateMock)
      const { status, output } = await reorderTaskSequenceInTrip.compensate(task)
      expect(status).toBe(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          message: '[Compensate] re-odrder task sequence in trip by tripId failed',
          stack: updateMock,
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
            previousTrip: {
              tasks: [
                '5f29506bd42f27001115e0d4',
                '5f29506bd42f27001115e0d5',
                '5f29506bd42f27001115e0d6',
              ],
              windowTime: ['2020-09-10T13:00:00.000Z', '2020-09-10T17:00:00.000Z'],
            },
          },
        },
      }

      tripRepository.model.update = jest.fn().mockResolvedValueOnce({ update: 1 })
      const { status, output } = await reorderTaskSequenceInTrip.compensate(task)
      expect(status).toBe(TaskStates.Completed)
      expect(output.updatedTripResult).toEqual({ update: 1 })
    })
  })
})
