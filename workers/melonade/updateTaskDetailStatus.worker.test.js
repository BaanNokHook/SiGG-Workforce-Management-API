import { TaskStates } from '@melonade/melonade-client'
import UpdateInternalTaskStatusWorker from './updateTaskDetailStatusworker'
import taskRepository from '../../models/task.repository'

describe('Update task detail status worker', () => {
  test('Update task detail status worker should process successfully', async () => {
    const task = {
      input: {
        taskId: '1',
        detailStatus: 'Processing',
      },
    }

    const taskResult = {
      taskId: '1',
      detailStatus: null,
    }

    const updatedTaskResult = {
      taskId: '1',
      detailStatus: task.input.detailStatus,
    }

    const worker = new UpdateInternalTaskStatusWorker()

    taskRepository.findOne = jest.fn().mockResolvedValueOnce(taskResult)
    taskRepository.update = jest.fn().mockResolvedValueOnce(updatedTaskResult)

    const { status, output } = await worker.process(task)

    expect(status).toBe(TaskStates.Completed)
    expect(taskRepository.findOne).toHaveBeenCalledTimes(1)
    expect(taskRepository.update).toHaveBeenCalledTimes(1)
    expect(output.updatedTaskResult.detailStatus).toBe('Processing')
  })

  test('Update task detail status worker should compensate successfully', async () => {
    const task = {
      input: {
        input: {
          taskId: '1',
          detailStatus: 'Processing',
        },
        output: {
          previousDetailStatus: null,
        },
      },
    }

    const updatedTaskResult = {
      taskId: '1',
      detailStatus: task.input.output.previousDetailStatus,
    }

    const worker = new UpdateInternalTaskStatusWorker()

    taskRepository.update = jest.fn().mockResolvedValueOnce(updatedTaskResult)

    const { status, output } = await worker.compensate(task)

    expect(status).toBe(TaskStates.Completed)
    expect(taskRepository.update).toHaveBeenCalledTimes(1)
    expect(output.updatedTaskResult.detailStatus).toBe(null)
  })
})
