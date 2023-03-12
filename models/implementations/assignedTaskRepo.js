// @flow
import AssignedTaskRepository from '../assignedTask.repository'
import { NotFound } from '../../constants/error'
import { type IBaseRepository } from './type'

export type AssignedTask = {
  _id?: string,
  taskId: string,
  createdAt?: string,
  updatedAt?: string,
}

export interface IAssignedTaskRepo {
  getAssignedTasks(): Promise<AssignedTask[]>;
  createAssignedTasks(assignedTasks: AssignedTask[]): Promise<AssignedTask[]>;
}

export class AssignedTaskRepo implements IAssignedTaskRepo {
  repo: IBaseRepository
  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  async getAssignedTasks(): Promise<AssignedTask[]> {
    try {
      const assignedTasks = await this.repo.find({})
      return (
        assignedTasks.data.map((assignedTask: AssignedTask) => assignedTask.taskId.toString()) || []
      )
    } catch (error) {
      throw error
    }
  }

  async createAssignedTasks(assignedTasks: AssignedTask[]): Promise<AssignedTask[]> {
    try {
      const inserted = await this.repo.insertMany(assignedTasks)
      return inserted.map((d: AssignedTask) => d.taskId.toString()) || []
    } catch (error) {
      throw error
    }
  }
}

export const assignedTaskRepo = new AssignedTaskRepo(AssignedTaskRepository)
