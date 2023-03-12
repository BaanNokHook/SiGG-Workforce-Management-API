import { TaskStates } from '@melonade/melonade-client'
import DeleteTodosByTask from './deleteTodosByTask.worker'
import taskRepository from '../../models/task.repository'
import todoRepository from '../../models/todo.repository'

describe('Delete todos by task', () => {
  const deleteTodosByTaskWorker = new DeleteTodosByTask()
  describe('Process', () => {
    test('delete todos success', async () => {
      const task = {
        input: {
          taskId: 'task_0',
        },
      }
      taskRepository.findOne = jest.fn().mockResolvedValueOnce({
        todos: ['todo_0', 'todo_1', 'todo_2'],
      })

      todoRepository.delete = jest.fn().mockResolvedValueOnce({
        n: 3,
        nModified: 3,
        ok: 3,
      })

      const { status, output } = await deleteTodosByTaskWorker.process(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output).toEqual({
        deletedTodos: ['todo_0', 'todo_1', 'todo_2'],
        deletedResult: {
          n: 3,
          nModified: 3,
          ok: 3,
        },
      })
    })

    test('do nothing when not found todos in task', async () => {
      const task = {
        input: {
          taskId: 'task_0',
        },
      }
      taskRepository.findOne = jest.fn().mockResolvedValueOnce({
        todos: [],
      })

      const { status, output } = await deleteTodosByTaskWorker.process(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output).toEqual({
        deletedTodos: [],
        deletedResult: null,
      })
    })

    test('delete todos failed', async () => {
      const task = {
        input: {
          taskId: 'task_0',
        },
      }
      taskRepository.findOne = jest.fn().mockResolvedValueOnce({
        todos: ['todo_0', 'todo_1', 'todo_2'],
      })

      todoRepository.delete = jest.fn().mockRejectedValueOnce({
        error: 'delete todos failed',
      })

      const { status, output } = await deleteTodosByTaskWorker.process(task)
      expect(status).toEqual(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          stack: {
            error: 'delete todos failed',
          },
        },
      })
    })
  })

  describe('Compensate', () => {
    test('restore todos success', async () => {
      const task = {
        input: {
          output: {
            deletedTodos: ['todo_0', 'todo_1', 'todo_2'],
          },
        },
      }

      todoRepository.model.restore = jest.fn().mockResolvedValueOnce({
        n: 3,
        nModified: 3,
        ok: 3,
      })

      const { status, output } = await deleteTodosByTaskWorker.compensate(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output).toEqual({
        restoredResult: {
          n: 3,
          nModified: 3,
          ok: 3,
        },
      })
    })

    test('restore todos failed', async () => {
      const task = {
        input: {
          output: {
            deletedTodos: ['todo_0', 'todo_1', 'todo_2'],
          },
        },
      }

      todoRepository.model.restore = jest.fn().mockRejectedValueOnce({
        error: 'restore todos failed',
      })

      const { status, output } = await deleteTodosByTaskWorker.compensate(task)
      expect(status).toEqual(TaskStates.Failed)
      expect(output).toEqual({
        error: {
          stack: {
            error: 'restore todos failed',
          },
        },
      })
    })

    test('do nothing when have no todos from process output', async () => {
      const task = {
        input: {
          output: {
            deletedTodos: [],
          },
        },
      }

      const { status, output } = await deleteTodosByTaskWorker.compensate(task)
      expect(status).toEqual(TaskStates.Completed)
      expect(output).toEqual({
        restoredResult: null,
      })
    })
  })
})
