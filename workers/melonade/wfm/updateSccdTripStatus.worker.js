import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import logger from '../../../libraries/logger'
import { IMelonadeWorker } from '../worker.interface'
import tripRepository from '../../../models/trip.repository'

export default class UpdateSccdTripStatusWorker implements IMelonadeWorker {
  get taskName() {
    return 'wfm_update_sccd_trip_status'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input } = task
    const { taskId } = input

    const loggerMetaData = {
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
      workflowName: task.taskName,
      conditions: ['process'],
      actions: ['wfm_update_sccd_trip_status'],
    }

    try {
      const tripResult = await tripRepository.findOne(
        {
          tasks: taskId,
        },
        {
          populate: {
            path: 'tasks',
          },
        },
      )

      const isLastCanceledTask =
        tripResult.tasks.filter((taskInTrip) => taskInTrip.status === 'CANCELED').length === 1 &&
        tripResult.tasks.length === 1

      let updatedTrip
      if (isLastCanceledTask) {
        updatedTrip = await tripRepository.update(
          { _id: tripResult._id },
          {
            $set: {
              status: 'DONE',
            },
          },
        )
      }

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
        message: 'Update trip status successfully',
        output: {
          tripId: tripResult._id,
          previousTripStatus: tripResult.status,
          updatedTrip,
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
        message: 'Update trip status failed',
        output: {
          error,
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input } = task
    const { tripId, previousTripStatus } = input.output

    const loggerMetaData = {
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
      workflowName: task.taskName,
      conditions: ['compensate'],
      actions: ['wfm_update_sccd_trip_status'],
    }

    try {
      await tripRepository.update({ _id: tripId }, { status: previousTripStatus })

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
        message: 'Restore previous trip status successfully',
        output: {
          tripId,
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
        message: 'Restore previous trip status failed',
        output: {
          error,
        },
      }
    }
  }
}
