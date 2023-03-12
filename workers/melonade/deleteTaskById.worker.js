import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import { IMelonadeWorker, logActions } from './worker.interface'
import taskRepository from '../../models/task.repository'

export default class DeleteTaskById implements IMelonadeWorker {
  get taskName() {
    return 'tms_delete_task_by_id'
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
      const deletedResult = await taskRepository.delete({ _id: taskId })
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
    const { taskId } = input.input
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
      const restoredResult = await taskRepository.model.restore({ _id: taskId })
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
