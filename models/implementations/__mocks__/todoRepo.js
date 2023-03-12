// @flow
import { TaskStatus } from '@sendit-th/conductor-client/build/helper/connector'
import { type IBaseRepository } from '../type'
/* *********** Todo ************** */
type TodoAction = 'CLICK' | 'SLIDE'

type TodoStatus = 'TODO' | 'DONE'

type TodoDeliveryStatus = 'PICK_UP' | 'DELIVER' | 'RETURN' | 'TRANSFER' | 'PROCESS' | 'REPAIR'

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
  todoType: string,
  sequenceSystem: number,
  companyId: string,
  projectId: string,
  referenceCompanyId: string,
  referenceProjectId: string,
  createdAt: string,
  updatedAt: string,
  taskId: string,
  deliveryStatus: TodoDeliveryStatus,
}

export interface ITodoRepo {
  updateById(todoId: string, todo: Todo): Promise<Todo>;
  updateStatus(todoId: string, status: TaskStatus): Promise<Todo>;
}

export class TodoRepo implements ITodoRepo {
  repo: IBaseRepository
  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  updateById(todoId: string, todo: Todo): Promise<Todo> {
    return this.repo.update({ _id: todoId }, todo)
  }

  updateStatus(todoId: string, status: TodoStatus): Promise<Todo> {
    return this.repo.update({ _id: todoId }, { status })
  }
}

// export const todoRepo = new TodoRepo(TaskRepository)
