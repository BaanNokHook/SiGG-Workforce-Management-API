// @flow
import type { Staff } from '../domains/staff/type'
import { type Trip } from '../models/implementations/tripRepo'

export interface TaskTypes {
  Task: 'TASK';
  Compensate: 'COMPENSATE';
  Parallel: 'PARALLEL';
  Decision: 'DECISION';
  Schedule: 'SCHEDULE';
}

export interface TaskStates {
  Scheduled: 'SCHEDULED';
  Inprogress: 'INPROGRESS';
  Completed: 'COMPLETED';
  Failed: 'FAILED';
  Timeout: 'TIMEOUT';
  AckTimeOut: 'ACK_TIMEOUT';
}

export interface IMelonadeTask {
  taskName: string;
  taskReferenceName: string;
  taskId: string;
  workflowId: string;
  transactionId: string;
  status: TaskStates;
  retries: number;
  isRetried: boolean;
  input: any;
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;
  logs?: any[];
  type: TaskTypes;
  parallelTasks?: any[][];
  decisions?: {
    [decision: string]: any[],
  };
  defaultDecision?: any[];
  retryDelay: number;
  ackTimeout: number;
  timeout: number;
  taskPath: (string | number)[];
}

export interface Description {
  th: string;
  en: string;
}

export interface Metadata {
  orderId: string;
  transactionId: string;
  taskId: string;
  todoTypeCode: string;
  taskTypeCode: string;
}

export interface RequestOptionsPayload {
  data: {
    fromPath: any[],
    toPath: any[],
  };
  baseURL: null;
}

export interface FullDocument {
  _id: string;
  requestOptionsPayload: RequestOptionsPayload;
  note: string;
  description: Description;
  title: Description;
  action: string;
  status: string;
  parcels: any[];
  isRequired: boolean;
  todosRequired: string[];
  isStart: boolean;
  isLast: boolean;
  isAccept: boolean;
  isHidden: boolean;
  isButton: boolean;
  isUser: boolean;
  isNotification: boolean;
  isBroadcast: boolean;
  isAutoNavigate: Boolean;
  isWebView: boolean;
  isRequestOptions: boolean;
  isUpload: boolean;
  isTrackWorkflow: boolean;
  result: null;
  value: null;
  deleted: boolean;
  tripRelate: any[];
  uploadOptions: any[];
  todoType: string;
  sequenceSystem: number;
  metadata: Metadata;
  companyId: string;
  projectId: string;
  referenceCompanyId: string;
  referenceProjectId: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  taskId: string;
}

export interface TmsTodoValue {
  _id: {
    _data: string,
  };
  operationType: string;
  fullDocument: FullDocument;
  ns: {
    db: string,
    coll: string,
  };
  documentKey: {
    _id: string,
  };
  updateDescription: {
    updatedFields: {
      taskId: string,
      updatedAt: Date,
    },
    removedFields: any[],
  };
}
export interface TmsStaffValue {
  _id: {
    _data: string,
  };
  operationType: string;
  fullDocument: Staff;
  ns: {
    db: string,
    coll: string,
  };
  documentKey: {
    _id: string,
  };
}

interface IAppointment {
  appointmentFrom: string;
  appointmentTo: string;
  appointmentNo: string;
}

export interface FmsAppointmentValue {
  _id: {
    _data: string,
  };
  operationType: string;
  fullDocument: IAppointment;
  ns: {
    db: string,
    coll: string,
  };
  documentKey: {
    _id: string,
  };
}
export interface MessageValue<T> {
  _id: {
    _data: string,
  };
  operationType: string;
  fullDocument: T;
  ns: {
    db: string,
    coll: string,
  };
  documentKey: {
    _id: string,
  };
}

export interface CloseWorkOrderAttrubute {
  key: string;
  value: string;
}

export interface CloseWorkOrderImage {
  name: stirng;
  url: stirng;
}

export interface CloseWorkOrderSerial {
  code: string;
  name: string;
  value: string;
}

export interface CloseWorkOrderSnAttribute {
  type: string;
  serialList: CloseWorkOrderSerial[];
}

export interface ICloseWorkOrder {
  requestNo: string;
  workOrderNo: string;
  serviceOrderNo: string;
  refWorkOrderNo?: string;
  requestCode: string;
  closeCode: string;
  reasonCode: string;
  testSignalPass: string;
  remark?: string;
  attributeList: CloseWorkOrderAttrubute[];
  imageList: CloseWorkOrderImage[];
  snAttributeList: CloseWorkOrderSnAttribute[];
}

export interface TmsTripValue {
  _id: {
    _data: string,
  };
  operationType: string;
  fullDocument: Trip;
  ns: {
    db: string,
    coll: string,
  };
  documentKey: {
    _id: string,
  };
  updateDescription: {
    updatedFields: {
      taskId: string,
      updatedAt: Date,
    },
    removedFields: any[],
  };
}
