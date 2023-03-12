import { IOrderType } from "../../../services/oms/interface";

export interface IGeometry {
  type: string;
  coordinates: number[];
}

export interface IFeature {
  type: string;
  geometry: IGeometry;
}

export interface IAddress {
  _id: string;
  feature: IFeature;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: IAddressMetaData;
  __v: number;
}

export interface IAddressMetaData {
  areaCode: string;
}

export interface IInstallationInformation {
  teamCode: string;
  teamName: string;
  engCode: string;
  customerName: string;
  contactName: string;
  contactPhone2: string;
  contactAddress: string;
  installationDate: string;
  timeSlot: string;
  latitude: string;
  longitude: string;
  custOrderNo: string;
  taskOrderNo: string;
  ordNo: string;
  workOrderNo: string;
  eventCode: string;
  acMode: string;
  taskType: string;
}

export interface IAttributeInformation {
  field_code: string;
  field_value: string;
  field_disp_value: string;
}

export interface IMetaInformation {
  installationInformation: IInstallationInformation;
  attributeInformation: IAttributeInformation[];
}

export interface IReference {
  suspend: boolean;
}

export interface ITaskType {
  skills: any[];
  equipments: any[];
  mapping: any[];
  active: boolean;
  isRequired: boolean;
  deleted: boolean;
  _id: string;
  code: string;
  name: string;
  taskTypeGroup: string;
  durationTime: number;
  autoSchedule: boolean;
  reference: IReference;
  projectId: string;
  companyId: string;
  referenceProjectId: string;
  referenceCompanyId: string;
  updatedAt: Date;
  createdAt: Date;
  __v: number;
  staffTotal: number;
  todoFlowId: string;
}

export interface IInstallationWorkflowInput {
  extensionFlow: string;
  taskType: ITaskType;
  address: IAddress;
  companyId: string;
  projectId: string;
  metaInformation: IMetaInformation;
  orderId: string;
  staff?: IStaff;
}

export interface IStaff {
  metaData: IMetaData;
}

export interface IMetaData {
  staffCode: string;
}

export interface OrderStatus {
  status: string;
  updatedAt: Date;
  _id?: string;
}

interface ITicket {
  queue: string;
  metaInformation: any;
}

export enum PRIORITY {
  Critical = 3,
  High = 2,
  Medium = 1,
  Low = 0,
}

export interface IAssuranceWorkflowInput {
  address: any;
  metaInformation: IMetaAssuranceInformation;
  ticket: ITicket;
  appointment: any;
  taskType: ITaskType;
  orderId: string;
  zone: IZone;
  priority?: PRIORITY;
  orderType?: IOrderType;
}

export interface IZone {
  _id: string;
}

export interface IAssuranceOrder {
  orderId: string;
  currentOrderStatus: string;
  workflowInput: IAssuranceWorkflowInput;
}

export interface IInstallationOrder {
  workflowInput: IInstallationWorkflowInput;
  _id: string;
  orderId: string;
  createdAt: Date;
  currentOrderStatus: string;
  orderStatuses: OrderStatus[];
  transactionId: string;
  updatedAt: Date;
}

export interface IData<T> {
  data: T[];
}

export interface IGetOrdersResponse<T> {
  data: IData<T>;
  status: string;
  statusCodes: number;
}

export interface IMetaAssuranceInformation {
  warrantyInformation?: IWarrantyInformation;
  [key: string]: any;
}

export interface IWarrantyInformation {
  subcontractorCode: string; // รหัสบริษัทที่รับผิดชอบ(Parent Team)
  subcontractorName: string; // ชื่อบริษัทที่รับผิดชอบ(Parent Team)
  subcontractorId: string; // ไอดีบริษัทที่รับผิดชอบ(Parent Team)
  teamCode: string; // รหัสทีมที่ติดตั้ง(Child Team)
  teamName: string; // ชื่อทีมที่เป็นผู้ติดตั้ง(Child Team)
  teamId: string; // ไอดีทีมที่เป็นผู้ติดตั้ง(Child Team)
  staffCode: string; // รหัสพนักงานที่เป็นผู้ติดตั้ง
  staffName: string; // ชื่อพนักงานที่เป็นผู้ติดตั้ง
  staffId: string; // ไอดีพนักงานที่เป็นผู้ติดตั้ง
  installationDate: Date; // วันที่ติดตั้ง
}
