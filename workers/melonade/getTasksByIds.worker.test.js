import { TaskStates } from '@melonade/melonade-client'
import taskRepository from '../../models/task.repository'
import GetTasksByIds from './getTasksByIds.worker'

describe('Get tasks by task ids', () => {
  const getTasksByIdsWorker = new GetTasksByIds()

  describe('Process', () => {
    test('get tasks by ids', async () => {
      const task: IGetTasksByIdsInput = {
        input: {
          vehicleID: 'staff_1',
          route: [{ id: 'task_0' }, { id: 'task_1' }],
        },
      }

      taskRepository.find = jest.fn().mockResolvedValueOnce({
        data: [{ _id: 'todo_0' }, { _id: 'todo_1' }],
      })

      const { status, output } = await getTasksByIdsWorker.process(task)

      expect(status).toEqual(TaskStates.Completed)
      expect(output.order).toEqual({
        taskIds: ['todo_0', 'todo_1'],
        tasks: [{ _id: 'todo_0' }, { _id: 'todo_1' }],
      })
    })
  })

  test('get tasks by ids with invalid taskIds', async () => {
    const task: IGetTasksByIdsInput = {
      input: {
        vehicleID: 'staff_1',
        route: [],
      },
    }

    const { status, output } = await getTasksByIdsWorker.process(task)

    expect(status).toEqual(TaskStates.Failed)
    expect(output.error.stack).toMatch(/Not found tasks to assign/)
  })
})
