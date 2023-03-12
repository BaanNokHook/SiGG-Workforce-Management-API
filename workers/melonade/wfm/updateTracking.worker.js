import { ITask, ITaskResponse, TaskStates } from '@melonade/melonade-client'
import {
  FleetApiService,
  fleetApiService,
  IFleetApiService,
} from '../../../adapters/restClient/fleet'
import { NotFound } from '../../../constants/error'
import tracking from '../../../domains/task/updateTracking'
import { RestClient } from '../../../libraries/client/restClient'
import logger from '../../../libraries/logger'
import { taskRepo } from '../../../models/implementations/taskRepo'
import { IMelonadeWorker } from '../worker.interface'

export default class UpdateTrackingWorker implements IMelonadeWorker {
  fleetService: IFleetApiService

  constructor() {
    const restClient = new RestClient()
    this.fleetService = new FleetApiService(restClient)
  }

  get taskName() {
    return 'wfm_update_tracking'
  }

  getPersonDetail = async (staffId: string) => {
    if (!staffId) {
      return { _id: 'N/A', firstname: 'N/A', lastname: 'N/A', phone: 'N/A' }
    }

    const data = await fleetApiService.getStaff(staffId)
    const { _id, firstname, lastname, phone, teamIds: [teamId] = [] } = data || {}

    return { _id, firstname, lastname, phone, teamId }
  }

  getError(error: Error) {
    if (error.status) {
      return {
        errorMesage: error.message,
        status: error.status,
        statusText: error.statusText,
        headers: error.headers,
        data: error.data,
        request: error.request,
      }
    }

    return error
  }

  async process(melonadeTask: ITask): Promise<ITaskResponse> {
    const { input = {} } = melonadeTask
    const { taskIds = [], type, assignedTo = {}, creator = {}, metadata = {} } = input

    try {
      if (!taskIds.length) {
        throw new Error('input is invalid: taskIds is Empty')
      }

      const updateTaskTracking = async (taskId) => {
        const task = await taskRepo.getTaskById(taskId)
        if (!task) {
          throw new Error(`task not found: taskId ${taskId}`)
        }

        const { staffs: [staffId] = [] } = task
        const personalData = await this.getPersonDetail(staffId)

        const updateData = {
          type,
          data: {
            assignedTo,
          },
          creator,
          metadata,
          createdAt: new Date(),
        }

        if (!(assignedTo && assignedTo.firstname) || !(assignedTo && assignedTo.lastname)) {
          updateData.data.assignedTo = personalData
        }

        if (
          metadata &&
          metadata.source &&
          metadata.source === 'HUMAN' &&
          (!(creator && creator.firstname) || !(creator && creator.lastname))
        ) {
          updateData.creator = personalData
        }

        metadata.previousTeamId = personalData.teamId
        metadata.previousAppointmentNo = task.appointmentNo

        const response = await tracking.push({ _id: taskId }, updateData)
        return {
          _id: response._id,
          ...updateData,
        }
      }

      const result = await Promise.all(taskIds.map(updateTaskTracking))

      return {
        status: TaskStates.Completed,
        message: 'tracking updated successfully',
        output: result,
      }
    } catch (error) {
      return {
        status: TaskStates.Failed,
        output: {
          error: this.getError(error),
        },
      }
    }
  }

  async compensate(melonadeTask: ITask): Promise<ITaskResponse> {
    const { input } = melonadeTask
    const { taskIds = [] } = input

    const loggerMetaData = {
      workflowTransactionId: melonadeTask.transactionId,
      workflowTaskId: melonadeTask.taskId,
      workflowName: melonadeTask.taskName,
      conditions: ['compensate'],
      actions: ['wfm_update_tracking'],
    }

    try {
      await Promise.all(taskIds.map((_taskId) => tracking.pop({ _id: _taskId })))

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
        message: 'tracking compensated successfully',
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
        message: 'tracking compensated unsuccessfully',
      }
    }
  }
}
