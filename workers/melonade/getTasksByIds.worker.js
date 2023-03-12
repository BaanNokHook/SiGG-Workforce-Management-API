import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import logger from '../../libraries/logger'
import taskRepository from '../../models/task.repository'
import { IMelonadeWorker, logActions } from './worker.interface'

export interface IDriverRouteLocation {
  id: string;
  lat: number;
  lng: number;
  timeWindowStart: number;
  timeWindowEnd: number;
  planStartTime: string;
  planFinishTime: string;
  travelingTime: number;
  serviceTime: number;
}

interface ITaskInput {
  route: IDriverRouteLocation[];
  vehicleID: String;
}

export interface IGetTasksByIdsInput extends ITask {
  input: ITaskInput;
}

export default class GetTasksByIds implements IMelonadeWorker {
  get taskName() {
    return 'get_tasks_by_ids'
  }

  async process(task: IGetTasksByIdsInput): Promise<ITaskResponse> {
    const { input, taskName, transactionId } = task
    const { route } = input

    try {
      logger.debug(
        { event: taskName },
        {
          action: logActions.processStarted,
          transactionId,
          taskName,
          input,
        },
      )

      if (!route) {
        throw new Error(`Invalid input may route is empty`)
      }

      const filterRoutes: any[] = route
      const taskIds = filterRoutes.map((r: any) => r.id)

      const tasks = await taskRepository.find({ _id: { $in: taskIds } })
      if (!tasks || !tasks.data || tasks.data.length === 0) {
        throw new Error(`Not found tasks to assign ${taskIds}`)
      }

      const orderResult = {
        order: {
          tasks: tasks.data,
          taskIds: tasks.data.map((t: any) => t._id),
        },
      }

      return {
        status: TaskStates.Completed,
        output: orderResult,
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
    const { input: inputTask } = input

    logger.debug(
      { event: taskName },
      {
        action: logActions.compensateStarted,
        output: {
          inputTask,
          transactionId,
        },
      },
    )

    return {
      status: TaskStates.Completed,
      output: {
        inputTask,
      },
    }
  }
}
