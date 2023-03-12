import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import R from 'ramda'
import logger from '../../../libraries/logger'
import { IMelonadeWorker } from '../worker.interface'
import taskRepository from '../../../models/task.repository'

export default class UpdateSCCDTaskMetaInfoWorker implements IMelonadeWorker {
  get taskName() {
    return 'wfm_update_sccd_task_meta_info'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input } = task
    const { orderId, status, completeType, processingStatus } = input

    const loggerMetaData = {
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
      workflowName: task.taskName,
      conditions: ['process'],
      actions: ['wfm_update_sccd_task_meta_info'],
    }

    try {
      const taskResult = await taskRepository.findOne({
        orderId,
      })

      const updatedTask = await taskRepository.update(
        { _id: taskResult._id },
        {
          $set: {
            status,
            'information.metaInformation.baseInformation.processingStatus': processingStatus,
            'information.metaInformation.baseInformation.completeType': completeType,
          },
        },
      )

      logger.info(
        {
          event: this.taskName,
        },
        {
          ...loggerMetaData,
          workflowStatus: TaskStates.Completed,
        },
      )

      return {
        status: TaskStates.Completed,
        message: 'Update task information successfully',
        output: {
          taskId: taskResult._id,
          tripId: taskResult.tripId,
          previousTaskStatus: R.path(['status'], taskResult),
          previousTaskMetaInfo: R.path(['information', 'metaInformation'], taskResult),
          updatedTask,
        },
      }
    } catch (error) {
      logger.error(
        {
          event: this.taskName,
        },
        {
          ...loggerMetaData,
          workflowStatus: TaskStates.Failed,
          error,
        },
      )
      return {
        status: TaskStates.Failed,
        message: 'Update task information failed',
        output: {
          error,
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input } = task
    const { taskId, previousTaskStatus, previousTaskMetaInfo } = input.output

    const loggerMetaData = {
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
      workflowName: task.taskName,
      conditions: ['compensate'],
      actions: ['wfm_update_sccd_task_meta_info'],
    }

    try {
      await taskRepository.update(
        { _id: taskId },
        {
          $set: {
            status: previousTaskStatus,
            'information.metaInformation': previousTaskMetaInfo,
          },
        },
      )

      logger.info(
        {
          event: this.taskName,
        },
        {
          ...loggerMetaData,
          workflowStatus: TaskStates.Completed,
        },
      )

      return {
        status: TaskStates.Completed,
        message: 'Restore previous task information successfully',
        output: {
          taskId,
        },
      }
    } catch (error) {
      logger.error(
        {
          event: this.taskName,
        },
        {
          ...loggerMetaData,
          workflowStatus: TaskStates.Failed,
          error,
        },
      )

      return {
        status: TaskStates.Failed,
        message: 'Restore previous task information failed',
        output: {
          error,
        },
      }
    }
  }
}
