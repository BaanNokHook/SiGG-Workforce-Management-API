import { ITask, ITaskResponse, TaskStates, Task } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import { IMelonadeWorker, logActions } from './worker.interface'
import tripRepository from '../../models/trip.repository'
import { TASK_STATUS } from '../../models/task.repository'
import { TRIP_STATUS } from '../../models/trip.repository'

export default class RemoveTaskFromTripWorker implements IMelonadeWorker {
  get taskName() {
    return 'tms_remove_task_from_trip'
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { taskId, tripId } = input

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
        logger.error(
          { event: taskName },
          {
            action: logActions.processFailed,
            transactionId,
            taskName,
            error: {
              message: 'Trip not found',
            },
          },
        )
        return {
          status: TaskStates.Failed,
          output: {
            error: {
              message: 'Trip not found',
            },
          },
        }
      }

      const removedTask = trip.tasks.find((task) => String(task._id) === taskId)

      if (!removedTask) {
        logger.error(
          { event: taskName },
          {
            action: logActions.processFailed,
            transactionId,
            taskName,
            error: {
              message: 'Task not found in this trip',
            },
          },
        )
        return {
          status: TaskStates.Failed,
          output: {
            error: {
              message: 'Task not found in this trip',
            },
          },
        }
      }

      const tasks = trip.tasks
        .filter((task) => String(task._id) !== taskId)
        .sort(
          (currentTask, nextTask) =>
            new Date(currentTask.windowTime[0]).getTime() -
            new Date(nextTask.windowTime[0]).getTime(),
        )

      if (tasks.length === 0) {
        const deletedTripResult = await tripRepository.delete({ _id: tripId })
        return {
          status: TaskStates.Completed,
          output: {
            removedTask,
            deletedTripResult,
            wasTripDeleted: true,
            previousTrip: trip,
          },
        }
      }

      const windowTime = [tasks[0].windowTime[0], tasks[tasks.length - 1].windowTime[1]]

      const isTripDone = !tasks.some(
        (_task) => _task.status !== TASK_STATUS.DONE && _task.isRequired,
      )
      const tripStatus = isTripDone ? TRIP_STATUS.DONE : trip.status

      const updatedData = {
        tasks: tasks.map((task) => task._id),
        status: tripStatus,
        windowTime,
      }

      const updatedTrip = await tripRepository.update({ _id: tripId }, updatedData)

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
          updatedTrip,
          updatedData,
          removedTask,
          wasTripDeleted: false,
          previousTrip: trip,
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
            tripId,
            stack: error,
          },
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { tripId } = input.input
    const { previousTrip, wasTripDeleted } = input.output

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
      if (wasTripDeleted) {
        const restoredTripResult = await tripRepository.model.restore({ _id: tripId })
        return {
          status: TaskStates.Completed,
          output: {
            message: 'Restore trip complete',
            restoredTripResult,
          },
        }
      }
      const updatedData = {
        tasks: previousTrip.tasks.map(task => task._id),
        status: previousTrip.status,
        windowTime: previousTrip.windowTime,
      }

      const updatedTrip = await tripRepository.update({ _id: tripId }, updatedData)
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
          updatedTrip,
          updatedData,
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
            tripId,
            stack: error,
          },
        },
      }
    }
  }
}
