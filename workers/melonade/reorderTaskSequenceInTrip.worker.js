import { TaskStates } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import * as R from 'ramda'
import { logActions } from './worker.interface'
import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'

export default class ReorderTaskSequenceInTrip {
  get taskName() {
    return 'tms_reorder_task_sequence_in_trip'
  }

  async process(task) {
    const { input, taskName, transactionId = '-' } = task
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
      const trip = await tripRepository.model
        .findOne({ _id: tripId, deleted: false })
        .populate([
          {
            path: 'tasks',
            select: '_id windowTime',
          },
        ])
        .select({
          _id: 1,
          tasks: 1,
          windowTime: 1,
        })
        .lean()

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
      const windowTime = [tasks[0].windowTime[0], tasks[tasks.length - 1].windowTime[1]]
      tasks = tasks.map((task) => task._id)

      await tripRepository.model.update(
        { _id: tripId, deleted: false },
        {
          $set: {
            tasks,
            windowTime,
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
          sortResult: {
            tasks,
            windowTime,
          },
          previousTrip: {
            tasks: trip.tasks.map((task) => task._id.toString()),
            windowTime: trip.windowTime,
          },
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
            message: '[Process] re-odrder task sequence in trip by tripId failed',
            stack: error,
          },
        },
      }
    }
  }

  async compensate(task) {
    const { input, taskName, transactionId = '-', taskId } = task
    const {
      previousTrip: { tasks, windowTime },
    } = input.output
    const { tripId } = input.input

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
      const updatedTripResult = await tripRepository.model.update(
        { _id: tripId, deleted: false },
        {
          $set: {
            tasks,
            windowTime,
          },
        },
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
          updatedTripResult,
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
            message: '[Compensate] re-odrder task sequence in trip by tripId failed',
            stack: error,
          },
        },
      }
    }
  }
}
