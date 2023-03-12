import { TaskStates } from '@melonade/melonade-client'
import UpdateSCCDTaskMetaInfoWorker from './updateSccdTaskMetaInfo.worker'
import taskRepository from '../../../models/task.repository'

describe('UpdateSCCDTaskMetaInfoWorker', () => {
  const updateSCCDTaskMetaInfoWorker = new UpdateSCCDTaskMetaInfoWorker()
  test('worker should process successfully', async () => {
    const task = {
      input: {
        workOrderNo: 'work_order_no_1',
        processingStatus: 'Finished',
        completeType: 'Canceled',
        status: 'CANCELED',
      },
    }

    const updatedTaskResult = {
      _id: 'task_1',
      tripId: 'trip_1',
      status: 'CANCELED',
      information: {
        metaInformation: {
          baseInformation: {
            processingStatus: 'Finished',
            completeType: 'Canceled',
          },
        },
      },
    }

    taskRepository.findOne = jest.fn().mockResolvedValueOnce({
      _id: 'task_1',
      tripId: 'trip_1',
      status: 'TODO',
      information: {
        metaInformation: {
          baseInformation: {
            processingStatus: 'Assigned',
          },
        },
      },
    })

    taskRepository.update = jest.fn().mockResolvedValueOnce(updatedTaskResult)

    const { status, output } = await updateSCCDTaskMetaInfoWorker.process(task)

    expect(status).toEqual(TaskStates.Completed)
    expect(output).toEqual({
      taskId: 'task_1',
      tripId: 'trip_1',
      previousTaskStatus: 'TODO',
      previousTaskMetaInfo: {
        baseInformation: {
          processingStatus: 'Assigned',
        },
      },
      updatedTask: updatedTaskResult,
    })
  })

  test('Worker should compensate when failed', async () => {
    const task = {
      input: {
        workOrderNo: 'work_order_no_1',
        processingStatus: 'Finished',
        completeType: 'Canceled',
        status: 'CANCELED',
      },
    }
    taskRepository.findOne = jest.fn().mockRejectedValueOnce({})
    const { status } = await updateSCCDTaskMetaInfoWorker.process(task)

    expect(status).toEqual(TaskStates.Failed)
  })
})
