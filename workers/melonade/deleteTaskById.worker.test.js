import { TaskStates } from '@melonade/melonade-client'
import DeleteTaskById from './deleteTaskById.worker'
import taskRepository from '../../models/task.repository'

describe('Delete task by id', () => {
  const deleteTaskByIdWorker = new DeleteTaskById()
  describe('Process', () => {
    test('delete task success', async () => {
      const task = {
        input: {
          taskId: 'task_0',
        },
      }
      taskRepository.delete = jest.fn().mockResolvedValueOnce({
        n: 1,
        nModified: 1,
        ok: 1,
      })
      const { status, output } = await deleteTaskByIdWorker.process(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output.deletedResult).toEqual({
        n: 1,
        nModified: 1,
        ok: 1,
      })
    })

    test('delete task failed', async () => {
      const task = {
        input: {
          taskId: 'task_0',
        },
      }
      taskRepository.delete = jest.fn().mockRejectedValueOnce({
        error: 'delete task failed',
      })
      const { status, output } = await deleteTaskByIdWorker.process(task)
      expect(status).toEqual(TaskStates.Failed)
      expect(output.error).toEqual({
        stack: { error: 'delete task failed' },
      })
    })
  })

  describe('Compensate', () => {
    test('restore task success', async () => {
      const task = {
        input: {
          input: {
            taskId: 'task_0',
          },
        },
      }
      taskRepository.model.restore = jest.fn().mockResolvedValueOnce({
        n: 1,
        nModified: 1,
        ok: 1,
      })
      const { status, output } = await deleteTaskByIdWorker.compensate(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output.restoredResult).toEqual({
        n: 1,
        nModified: 1,
        ok: 1,
      })
    })

    test('restore task failed', async () => {
      const task = {
        input: {
          input: {
            taskId: 'task_0',
          },
        },
      }
      taskRepository.model.restore = jest.fn().mockRejectedValueOnce({
        error: 'restore task failed',
      })
      const { status, output } = await deleteTaskByIdWorker.compensate(task)
      expect(status).toEqual(TaskStates.Failed)
      expect(output.error).toEqual({
        stack: { error: 'restore task failed' },
      })
    })
  })
})
