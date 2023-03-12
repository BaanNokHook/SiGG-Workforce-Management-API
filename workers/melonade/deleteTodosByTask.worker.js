import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import { IMelonadeWorker, logActions } from './worker.interface'
import taskRepository from '../../models/task.repository'
import todoRepository from '../../models/todo.repository'

export default class DeleteTodosByTask implements IMelonadeWorker {
  get taskName() {
    return 'tms_delete_todos_by_task'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { taskId } = input
    logger.info(
      { event: taskName },
      {
        action: logActions.processStarted,
        transactionId,
        taskName,
        input,
      },
    )

    try {
      const task = await taskRepository.findOne({ _id: taskId })
      const { todos } = task

      let deletedResult = null
      if (todos.length > 0) {
        deletedResult = await todoRepository.delete({ _id: { $in: todos } })
      }

      logger.info(
        { event: taskName },
        {
          action: logActions.processCompleted,
          transactionId,
          taskName,
        },
      )
      return {
        status: TaskStates.Completed,
        output: {
          deletedTodos: todos,
          deletedResult,
        },
      }
    } catch (error) {
      logger.error(
        { event: taskName },
        {
          action: logActions.processFailed,
          transactionId,
          taskName,
          error,
        },
      )
      return {
        status: TaskStates.Failed,
        output: {
          error: {
            stack: error,
          },
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { deletedTodos } = input.output
    logger.info(
      { event: taskName },
      {
        action: logActions.compensateStarted,
        transactionId,
        taskName,
        input,
      },
    )

    try {
      let restoredResult = null
      if (deletedTodos.length > 0) {
        restoredResult = await todoRepository.model.restore({ _id: { $in: deletedTodos } })
      }
      logger.info(
        { event: taskName },
        {
          action: logActions.compensateCompleted,
          transactionId,
          taskName,
        },
      )
      return {
        status: TaskStates.Completed,
        output: {
          restoredResult,
        },
      }
    } catch (error) {
      logger.error(
        { event: taskName },
        {
          action: logActions.compensateFailed,
          transactionId,
          taskName,
          error,
        },
      )
      return {
        status: TaskStates.Failed,
        output: {
          error: {
            stack: error,
          },
        },
      }
    }
  }
}
