import { TaskStates } from '@melonade/melonade-client'
import UpdateSccdTripStatusWorker from './updateSccdTripStatus.worker'
import tripRepository from '../../../models/trip.repository'

describe('UpdateSCCDTaskMetaInfoWorker', () => {
  const updateSccdTripStatusWorker = new UpdateSccdTripStatusWorker()
  test('worker should process successfully when there is only one CANCELED task', async () => {
    const task = {
      input: {
        taskId: 'task_id_1',
      },
    }

    const updatedTripResult = {
      _id: 'trip_id_1',
      status: 'TODO',
      tasks: [
        {
          _id: 'task_id_1',
          status: 'CANCELED',
        },
      ],
    }

    tripRepository.findOne = jest.fn().mockResolvedValueOnce({
      _id: 'trip_id_1',
      status: 'TODO',
      tasks: [
        {
          _id: 'task_id_1',
          status: 'CANCELED',
        },
      ],
    })

    tripRepository.update = jest.fn().mockResolvedValueOnce(updatedTripResult)

    const { status, output } = await updateSccdTripStatusWorker.process(task)

    expect(status).toEqual(TaskStates.Completed)
    expect(output).toEqual({
      tripId: 'trip_id_1',
      previousTripStatus: 'TODO',
      updatedTrip: updatedTripResult,
    })
  })

  test('Worker should compensate when failed', async () => {
    const task = {
      input: {
        taskId: 'task_id_1',
      },
    }
    tripRepository.findOne = jest.fn().mockRejectedValueOnce({})
    const { status } = await updateSccdTripStatusWorker.process(task)
    expect(status).toEqual(TaskStates.Failed)
  })
})
