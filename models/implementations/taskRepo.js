// @flow
import mongoose from 'mongoose'
import R from 'ramda'
import moment from 'moment'
import TaskRepository, { LIST_TASK_STATUS_CANCELLED } from '../task.repository'
import { type IBaseRepository, type Options, type Populate } from './type'
import { NotFound } from '../../constants/error'
import { type TaskType } from '../taskType.repository'
// eslint-disable-next-line import/no-cycle
import { type Trip } from './tripRepo'
// eslint-disable-next-line import/no-cycle
import { type Todo } from './todoRepo'
import { type ResponseSerializer, updateManyResponseSerializer } from '../../utils/serializer'
import logger from '../../libraries/logger'
// eslint-disable-next-line import/no-cycle
import type { Skill } from '../../domains/task/autoAssignTask'

interface Response<T> {
  data: T;
  [key: string]: string;
}

export type Parcel = {
  productId: string,
  sku: string,
  name: string,
  description: string,
  weight: number,
  dimension: {
    length: number,
    width: number,
    height: number,
    depth: number,
  },
  price: number,
  refOrderId?: string,
}

export type TaskInformation = {
  consignment: string,
  name: string,
  phone: string,
  note: string,
  courier: { name: string, type: string, amount: string },
  parcels: Parcel[],
}

export type TaskStatus = 'PENDING' | 'TODO' | 'DOING' | 'DONE' | 'CANCELLED' | 'FAILED' | 'REJECTED'

type DeliverStatus = 'PICK_UP' | 'DELIVER' | 'RETURN' | 'TRANSFER' | 'PROCESS' | 'REPAIR'

export type StatusMetadata = {
  reason: string,
  note?: string,
}

export type Task = {
  tripId: Trip,
  sequenceSystem: number,
  sequenceManual: number,
  todos: Todo[],
  parcels: Parcel[],
  staffs: [],
  passengers: [],
  rejectRequest: [],
  status: TaskStatus,
  windowTime: Date[],
  requireSkills: [],
  note: string,
  adminNote: string,
  geographyId: string,
  referenceGeographyId: string,
  workflowInstanceId: string,
  workflowTaskId: string,
  workflowType: string,
  priority: number,
  appointmentNo: string,
  standardTimeLength: string,
  isRequired: boolean,
  deleted: boolean,
  _id: string,
  information: TaskInformation,
  projectId: string,
  companyId: string,
  deliveryStatus: DeliverStatus,
  taskId: string,
  referenceCompanyId: string,
  referenceProjectId: string,
  taskTypeId: TaskType,
  track: [],
  remarks: [],
  createdAt: string,
  updatedAt: string,
  statusMetadata: StatusMetadata,
}

export interface ITaskRepo {
  updateStatus(taskId: string, status: TaskStatus): Promise<Task>;
  getTaskById(mongoTaskId: string, populate?: Populate[]): Promise<Task>;
  getTaskByIds(taskIds: string[], option?: Options): Promise<Task[]>;
  getUnassignedTasksFromTaskPool(
    areaCodes: number[],
    maximumWorkTime: number,
    dateTime: string,
    skills: Skill[],
    staffId: string,
  ): Promise<Task[]>;
  getUnassignedTasksFromTaskPoolByAreaCode(areaCodes: string[]): Promise<Response<Task[]>>;
  isHasTasks(taskIds: string[] | string): Promise<boolean>;
  isRelatedWithTrip(taskIds: string[]): Promise<boolean>;
  bindTripToTask(tripId: string, taskIds: string[]): Promise<void>;
  updateMany(filter: any, data: any): Promise<Task[]>;
  updateStatusAndStatusMetadata(
    taskId: string,
    mongoTripId: string,
    status: TaskStatus,
    statusMetadata: StatusMetadata,
  ): Promise<Task>;
  updateStatusTasks(mongoTaskIds: string[], status: TaskStatus): Promise<ResponseSerializer>;
  update(filter: {}, payload: {}): Promise<Task>;
  updateParcelsAndPayment(taskId: string, information: any): Promise<Task>;
}

export class TaskRepo implements ITaskRepo {
  repo: IBaseRepository

  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  async updateStatusTasks(mongoTaskIds: string[], status: TaskStatus) {
    const logMetadata = {
      event: 'update_status_tasks',
      taskIds: mongoTaskIds,
      status,
    }
    try {
      const taskUpdated = await this.repo.model.updateMany(
        { _id: { $in: mongoTaskIds } },
        { status },
      )
      const taskUpdatedResponse = updateManyResponseSerializer(taskUpdated)

      logger.info(logMetadata, taskUpdatedResponse)
      return taskUpdatedResponse
    } catch (err) {
      logger.error({ ...logMetadata, err })
      throw err
    }
  }

  updateStatus(taskId: string, status: TaskStatus): Promise<Task> {
    try {
      return this.repo.update({ _id: taskId }, { status })
    } catch (error) {
      throw new Error('update task status failed')
    }
  }

  updateStatusAndStatusMetadata(
    taskId: string,
    mongoTripId: string,
    status: TaskStatus,
    statusMetadata: StatusMetadata,
  ): Promise<Task> {
    return this.repo.update({ taskId, tripId: mongoTripId }, { status, statusMetadata })
  }

  async getTaskById(mongoTaskId: string, populate?: Populate[] = []): Promise<Task> {
    try {
      const task = await this.repo.findOne({ _id: mongoTaskId }, { populate })
      if (!task) {
        throw new NotFound(`task ${mongoTaskId} not found`)
      }
      return task
    } catch (error) {
      throw error
    }
  }

  async getTaskByIds(taskIds: string[], option?: Options): Promise<Task[]> {
    try {
      const tasks = await this.repo.find(
        {
          _id: {
            $in: taskIds,
          },
        },
        option,
      )
      if (!tasks) {
        throw new NotFound(`task ${taskIds} not found`)
      }
      return tasks
    } catch (error) {
      throw error
    }
  }

  async getUnassignedTasksFromTaskPoolByAreaCode(
    areaCodes: string[],
    options?: Options,
  ): Promise<Response<Task[]>> {
    const queryTask = {
      projectId: mongoose.Types.ObjectId('5cf0ad79b603c7605955bc7f'),
      'information.metaInformation.extraInformation.queue': {
        $in: ['R', 'A'],
      },
      'information.metaInformation.orderBaseInformation.areaCode': {
        $in: areaCodes,
      },
      status: {
        $in: ['FAILED', 'NEW'],
      },
      $and: [
        {
          'information.metaInformation.baseInformation.deadline': {
            $lte: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          },
        },
        {
          'information.metaInformation.baseInformation.deadline': {
            $gte: moment().utc().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
          },
        },
      ],
    }

    const tasks = await this.repo.find(queryTask, {
      ...options,
      populate: [{ path: 'taskTypeId' }],
    })
    const { data, ...rest } = tasks
    if (data.length === 0) {
      throw new Error('Task find not found')
    }

    return {
      data: R.sortWith(
        [
          R.ascend(R.path(['information', 'metaInformation', 'baseInformation', 'deadline'])),
          R.ascend(R.path(['information', 'metaInformation', 'extraInformation', 'queue'])),
          R.descend(R.path(['orderPriority'])),
        ],
        tasks.data.map(this.mergePriority),
      ),
      ...rest,
    }
  }

  mergePriority(task: any) {
    let priority
    switch (task.information.metaInformation.orderBaseInformation.priority) {
      case 'Critical':
        priority = 4
        break
      case 'High':
        priority = 3
        break
      case 'Medium':
        priority = 2
        break
      case 'Low':
        priority = 1
        break
      default:
        priority = 1
    }

    return {
      ...task.toObject(),
      orderPriority: priority,
    }
  }

  async getUnassignedTasksFromTaskPool(
    areaCodes: number[],
    maximumWorkTime: number,
    dateTime: string,
    skills: Skill[],
    staffId: string,
  ): Promise<Task[]> {
    const endDeadline = `${moment(dateTime).utc().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss')}`
    const startDeadline = `${moment(dateTime).utc().format('YYYY-MM-DD HH:mm:ss')}`

    const queryTask = {
      projectId: mongoose.Types.ObjectId('5cf0ad79b603c7605955bc7f'),
      'information.metaInformation.extraInformation.queue': {
        $in: ['R', 'A'],
      },
      'information.metaInformation.orderBaseInformation.areaCode': {
        $in: areaCodes,
      },
      'information.metaInformation.warrantyInformation': {
        $exists: false,
      },
      status: {
        $in: ['FAILED', 'NEW'],
      },
      'information.metaInformation.baseInformation.standardTimeLength': {
        $lte: maximumWorkTime,
      },
      $and: [
        {
          'information.metaInformation.baseInformation.deadline': {
            $lte: endDeadline,
          },
        },
        {
          'information.metaInformation.baseInformation.deadline': {
            $gte: startDeadline,
          },
        },
      ],
    }

    logger.info({ event: 'AUTO_ASSIGNED_QUERY_TASK_POOL', staffId }, JSON.stringify(queryTask))

    const tasks = await this.repo.find(queryTask, { populate: [{ path: 'taskTypeId' }] })
    if (tasks.data.length === 0) {
      throw new NotFound(JSON.stringify(queryTask))
    }

    const isStaffSkillsMatchWithTask = (task): boolean => {
      const taskSkills = task.taskTypeId.skills.length
      let matchedTaskSkills = 0

      for (let j = 0; j < taskSkills; j += 1) {
        for (let i = 0; i < skills.length; i += 1) {
          if (skills[i].id === task.taskTypeId.skills[j].toString()) {
            matchedTaskSkills += 1
          }
        }
      }

      return matchedTaskSkills === taskSkills
    }

    return R.sortWith(
      [
        R.ascend(R.path(['information', 'metaInformation', 'baseInformation', 'deadline'])),
        R.ascend(R.path(['information', 'metaInformation', 'extraInformation', 'queue'])),
        R.descend(R.path(['orderPriority'])),
      ],
      tasks.data.filter(isStaffSkillsMatchWithTask).map(this.mergePriority),
    )
  }

  updateMany(filter: any, data: any): Promise<Task[]> {
    return this.repo.model.updateMany(filter, data)
  }

  async isHasTasks(taskIds: string[] | string): Promise<boolean> {
    let tasks
    if (typeof taskIds === 'string') {
      tasks = await this.repo.find({ _id: taskIds })
    } else {
      tasks = await this.repo.find({ _id: { $in: taskIds } })
    }
    return tasks.total > 0
  }

  async isRelatedWithTrip(taskIds: string[]): Promise<boolean> {
    const tasks = await this.repo.find({ _id: { $in: taskIds } })
    return tasks.data.some((task) => task.tripId !== null)
  }

  async bindTripToTask(tripId: string, taskIds: string[]): Promise<void> {
    try {
      await this.repo.model.updateMany({ _id: { $in: taskIds } }, { tripId })
    } catch (error) {
      throw error
    }
  }

  update(filter: {}, payload: {}) {
    return this.repo.update(filter, payload)
  }

  async updateParcelsAndPayment(taskId: string, information: any) {
    try {
      const task = await this.repo.update(
        { taskId, deliveryStatus: { $in: ['PICK_UP', 'DELIVER'] }, status: { $nin: LIST_TASK_STATUS_CANCELLED } },
        {
          'information.parcels': information.parcels,
          'information.payment': information.payment,
        },
      )
      return task
    } catch (error) {
      throw error
    }
  }
}

export const taskRepo = new TaskRepo(TaskRepository)
