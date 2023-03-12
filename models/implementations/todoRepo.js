// @flow
import TodoRepository from '../todo.repository'
import { type IBaseRepository, type Populate } from './type'
// eslint-disable-next-line import/no-cycle
import { type Task } from './taskRepo'
import { type TodoType } from '../todoType.repository'
import { NotFound } from '../../constants/error'

export type TodoAction = 'CLICK' | 'SLIDE'

export type TodoStatus = 'TODO' | 'DONE'

export type TodoDeliveryStatus =
  | 'PICK_UP'
  | 'DELIVER'
  | 'RETURN'
  | 'TRANSFER'
  | 'PROCESS'
  | 'REPAIR'

export type Todo = {
  requestOptionsPayload: { data: { fromPath: [], toPath: [] }, baseURL: null },
  note: string,
  description: null,
  action: TodoAction,
  status: TodoStatus,
  parcels: [],
  passengers: [],
  isRequired: boolean,
  isStart: boolean,
  isLast: boolean,
  isAccept: boolean,
  isHidden: boolean,
  isButton: boolean,
  isUser: boolean,
  isNotification: boolean,
  isBroadcast: boolean,
  isAutoNavigate: boolean,
  isWebView: boolean,
  isRequestOptions: boolean,
  isUpload: boolean,
  isTrackWorkflow: boolean,
  result: null,
  value: null,
  deleted: boolean,
  _id: string,
  tripRelate: [],
  uploadOptions: [],
  todoType: TodoType,
  sequenceSystem: number,
  companyId: string,
  projectId: string,
  referenceCompanyId: string,
  referenceProjectId: string,
  createdAt: string,
  updatedAt: string,
  taskId: Task,
  deliveryStatus: TodoDeliveryStatus,
}

export interface ITodoRepo {
  getTodo(todoId: string, options?: { populate: Populate[] }): Promise<Todo>;
  updateById<T>(todoId: string, todo: T): Promise<Todo>;
  updateStatus(todoId: string, status: TodoStatus): Promise<Todo>;
}

export class TodoRepo implements ITodoRepo {
  repo: IBaseRepository
  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  async getTodo(todoId: string, options?: { populate: Populate[] }): Promise<Todo> {
    try {
      const todo = await this.repo.findOne({ _id: todoId }, options)

      if (!todo) {
        throw new NotFound(`Todo ${todoId} not found`)
      }

      return todo
    } catch (error) {
      throw error
    }
  }

  updateById<T>(todoId: string, todo: T): Promise<Todo> {
    return this.repo.update({ _id: todoId }, todo)
  }

  updateStatus(todoId: string, status: TodoStatus): Promise<Todo> {
    return this.repo.update({ _id: todoId }, { status })
  }
}

export const todoRepo = new TodoRepo(TodoRepository)
