export interface IResponse<T> {
  data: T;
  limit: number;
  page: number;
  pageSize: number;
  count: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface IReqeustOption {
  limit?: number;
  page?: number;
}

export enum ERequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Comments {
  commentedBy: string;
  messages: string;
}

export interface Task {
  circuitNo: string;
  _id: string;
}

export interface Item {
  no: number;
  code: string;
  type: string;
  name: string;
  actions: string;
  isHide: boolean;
  isAutoApproval: boolean;
  approverRolesBefore: string;
  approverRolesAfter: string;
  flowsBefore: string;
  flowsAfter: string;
  isWaitingRequired: boolean;
  nextAction: string;
}

export interface Reason {
  item: Item;
  deleted: boolean;
  _id: string;
  companyId: string;
  projectId: string;
  collectionName: string;
  revision: number;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Task {
  _id: string;
  orderId: string;
}

export enum RequestAction {
  REJECT = 'BEFORE_ACCEPT',
  RETUEN = 'AFTER_ACCEPT',
}

export interface Metadata {
  type?: string;
  action?: RequestAction;
  reason?: Reason;
  note?: string;
  task: Task;
}

export interface History {
  comments: Comments;
  status: ERequestStatus;
  requestId: string;
  metadata: Metadata;
  createdAt: Date;
  requestTypeId: string;
  companyId: string;
  requestedBy: string;
  _id: string;
  projectId: string;
  updatedAt: Date;
}

export interface IRequest {
  comments: Comments;
  status: ERequestStatus;
  _id: string;
  requestedBy: string;
  expiredDate?: any;
  updatedAt: Date;
  projectId: string;
  approver?: any;
  companyId: string;
  history: History[];
  requestId: string;
  requestTypeId: string;
  createdAt: Date;
  teamId: string;
  path: string;
  metadata: Metadata;
}

export interface IRequestParam extends IReqeustOption {
  statuses: ERequestStatus[];
  taskId?: string;
  teamId?: string;
  requestedBy?: string;
  taskIds?: string[];
}

export interface IAutoApprovalOption {
  isActive: boolean;
  amount: number;
  unit: moment.unitOfTime.Base;
}

export interface IRequestType {
  _id?: string;
  name: string;
  options?: {
    autoApproval?: IAutoApprovalOption;
  };
  projectId: string;
  companyId: string;
}

export interface IRequestApproveService {
  getReqeusts(requestParams: IRequestParam): Promise<IRequest[]>;
  getRequestTypes(): Promise<IRequestType[]>;
}
