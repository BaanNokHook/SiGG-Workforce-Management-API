export enum STATUS_CODE {
  SUCCESS = "0",
  ERROR = "-1",
}

export interface IUpdateTechnicianInTaskResponse {
  code: STATUS_CODE;
  Msg: string;
}

export interface IUpdateCallLogRequest {
  staffCode: string;
  staffName: string;
  taskOrderNo: string;
  contactName: string;
  contactNumber: string;
  callTime: string;
}

export interface IUpdateCallLogResponse {
  code: STATUS_CODE;
  Msg: string;
}
