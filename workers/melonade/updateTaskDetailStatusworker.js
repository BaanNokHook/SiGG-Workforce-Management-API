import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import { IMelonadeWorker, logActions } from './worker.interface'
import taskRepository from '../../models/task.repository'

export default class UpdateTaskDetailStatus implements IMelonadeWorker {
  get taskName() {
    return 'tms_update_task_detail_status'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { taskId, detailStatus } = input
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
      const taskResult = await taskRepository.findOne({ _id: taskId })
      const updatedTaskResult = await taskRepository.update(
        { _id: taskId },
        {
          $set: {
            detailStatus,
          },
        },
      )
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
          previousDetailStatus: taskResult.detailStatus,
          updatedTaskResult,
        },
      }
    } catch (error) {
      logger.error({
        event: taskName,
        action: logActions.processFailed,
        transactionId,
        taskName,
        error,
      })
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
    const { previousDetailStatus } = input.output
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
      const updatedTaskResult = await taskRepository.update(
        { _id: taskId },
        { detailStatus: previousDetailStatus },
      )

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
          updatedTaskResult,
        },
      }
    } catch (error) {
      logger.error({
        event: taskName,
        action: logActions.compensateFailed,
        transactionId,
        taskName,
        error,
      })
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
