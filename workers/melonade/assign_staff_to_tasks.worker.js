import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import { Types } from 'mongoose'
import logger from '../../libraries/logger'
import taskRepository from '../../models/task.repository'
import { IDriverRouteLocation } from './getTasksByIds.worker'
import { IMelonadeWorker, logActions } from './worker.interface'

export interface ITaskInput {
  tasks: any[];
  route: IDriverRouteLocation[];
  staffId: String;
}

interface ITaskAssignStaffToTasksWithOptimizeOutput extends ITask {
  input: ITaskInput;
}

interface IPlanTime {
  travelingTime: number;
  planStartTime: string;
  planFinishTime: string;
}

export default class AssignStaffToTasksWithOptimizeOutput implements IMelonadeWorker {
  get taskName() {
    return 'assign_staff_to_tasks_with_optimize_output'
  }

  updateStaffAndDetailInTask(staffId: string, driverRoute: IDriverRouteLocation, task: any): any {
    let updatedTask = {
      ...task,
      staffs: [staffId],
      tripId: null,
    }

    if (updatedTask.information.metaInformation.orderBaseInformation) {
      updatedTask.information.metaInformation.orderBaseInformation.travelingTime =
        driverRoute.travelingTime
    }

    return updatedTask
  }

  getDriverRouteLocationByTaskId(
    taskId: string,
    routes: IDriverRouteLocation[],
  ): IDriverRouteLocation {
    const resultRoute = routes.filter((route) => route.id === taskId)
    if (!resultRoute || resultRoute.length === 0) {
      throw new Error(`no route in result (taskId:${taskId})`)
    }

    return resultRoute[0]
  }

  async process(task: ITaskAssignStaffToTasksWithOptimizeOutput): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { staffId, route, tasks } = input

    logger.debug(
      { event: taskName },
      {
        action: logActions.processStarted,
        transactionId,
        taskName,
        input,
      },
    )
    try {
      // TODO: 0. validate input
      if (!staffId || staffId === '') {
        throw new Error(`Invalid input staffId is required`)
      }

      if (!tasks || tasks.length === 0) {
        throw new Error(`Invalid input tasks is required`)
      }

      let resultUpdatedTasks: any[] = []

      // TODO: 1. loop set staffId, traveling time, planStart and finish to tasks
      for (const task of tasks) {
        const driverRouteLocation = this.getDriverRouteLocationByTaskId(task._id, route)
        const updatedTask = this.updateStaffAndDetailInTask(staffId, driverRouteLocation, task)

        resultUpdatedTasks.push(updatedTask)
      }

      // TODO: 2. batch update tasks data to mongo
      const bulkWriteCommand = resultUpdatedTasks.map((updatedTask) => {
        return {
          updateOne: {
            filter: {
              _id: Types.ObjectId(updatedTask._id),
            },
            update: {
              $set: {
                staffs: updatedTask.staffs
                  ? updatedTask.staffs.map((staffId) => Types.ObjectId(staffId))
                  : [],
                tripId: null,
                'information.metaInformation.orderBaseInformation.travelingTime':
                  updatedTask.information.metaInformation.orderBaseInformation.travelingTime,
              },
            },
          },
        }
      })

      const updatedTasksResult = await taskRepository.model.bulkWrite(bulkWriteCommand)

      // TODO: 3. return updated tasks to output
      return {
        status: TaskStates.Completed,
        output: {
          tasks: resultUpdatedTasks,
          taskIds: resultUpdatedTasks.map((t: any) => t._id),
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
            stack: JSON.stringify(error.stack),
          },
        },
      }
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const {
      input: { staffId, route, tasks: tasksBeforeUpdated },
    } = input

    logger.debug(
      { event: taskName },
      {
        action: logActions.compensateStarted,
        output: {
          input,
          transactionId,
        },
      },
    )

    const bulkWriteCommand = tasksBeforeUpdated.map((taskBeforeUpdated) => {
      return {
        updateOne: {
          filter: {
            _id: Types.ObjectId(taskBeforeUpdated._id),
          },
          update: {
            $set: {
              staffs: taskBeforeUpdated.staffs
                ? taskBeforeUpdated.staffs.map((staffId) => Types.ObjectId(staffId))
                : [],
              tripId: taskBeforeUpdated.tripId,
              'information.metaInformation.orderBaseInformation.travelingTime':
                taskBeforeUpdated.information.metaInformation.orderBaseInformation.travelingTime,
            },
          },
        },
      }
    })

    const revertTasksResult = await taskRepository.model.bulkWrite(bulkWriteCommand)

    return {
      status: TaskStates.Completed,
      output: {
        revertTasks: tasksBeforeUpdated,
        commandWrites: bulkWriteCommand,
        revertTasksResult,
      },
    }
  }
}
