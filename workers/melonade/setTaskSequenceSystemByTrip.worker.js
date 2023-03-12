import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import { Types } from 'mongoose'
import * as R from 'ramda'
import { IMelonadeWorker, logActions } from './worker.interface'
import logger from '../../libraries/logger'
import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'

export default class SetTaskSequenceSystemByTripIdWorker implements IMelonadeWorker {
  get taskName() {
    return 'tms_set_task_sequence_system_by_trip_id'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { tripId } = input
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
      const trip = await tripRepository.findOne(
        { _id: tripId },
        {
          populate: [
            {
              path: 'tasks',
            },
          ],
        },
      )

      if (!trip) {
        logger.info(
          { event: taskName },
          {
            action: logActions.processCompleted,
            message: 'Trip not found',
            transactionId,
            taskName,
          },
        )
        return {
          status: TaskStates.Completed,
          output: {
            message: 'Trip not found',
          },
        }
      }

      const clonedTrip = R.clone(trip)
      let { tasks } = clonedTrip

      tasks = tasks.sort(
        (currentTask, nextTask) =>
          new Date(currentTask.windowTime[0]).getTime() -
          new Date(nextTask.windowTime[0]).getTime(),
      )

      const updatedTasksResult = await Promise.all(
        tasks.map((_task, index) => {
          const { _id } = _task
          const sequenceSystem = index + 1
          // eslint-disable-next-line no-param-reassign
          _task.sequenceSystem = sequenceSystem
          return taskRepository.update({ _id }, { sequenceSystem })
        }),
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
          previousTasks: trip.tasks,
          sortedTasks: tasks,
          updatedTasksResult,
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
            message: '[Process] Set task sequence system by trip id failed',
            stack: error,
          },
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId, taskId } = task
    const { previousTasks: tasks } = input.output
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
      const updatedTasksResult = await Promise.all(
        tasks.map((_task) => {
          const { _id, sequenceSystem } = _task
          return taskRepository.update({ _id }, { sequenceSystem })
        }),
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
          updatedTasksResult,
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
            message: '[Compensate] Set task sequence system by trip id failed',
            stack: error,
          },
        },
      }
    }
  }
}
