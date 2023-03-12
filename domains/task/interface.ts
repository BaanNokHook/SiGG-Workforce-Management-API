export enum TaskDirection {
  PICKUP = 'PICKUP',
  DELIVER = 'DELIVER',
}

export interface IWorkflowInputTask {
  address: ITaskAddress;
  information: IInformation;
  appointment?: IAppointment;
  windowTime?: string[];
  taskType: string;
  direction: string;
  staffs: any[];
  projectId: string;
  companyId: string;
  note?: string;
}

export interface IAppointment {
  appointmentFrom: string;
  appointmentTo?: string;
}

export interface IInformation {
  name: string;
  phone: string;
  parcels: IParcel[];
  note: string;
  payment?: ITaskPayment;
  vehicle?: ICustomerVehicleType;
}

export interface ICustomerVehicleType {
  type: string;
  amount: number;
}

export interface ITaskPayment {
  method: string;
  amount: number;
  extraCODAmount?: number;
}

export enum IParcelType {
  PRODUCTS = 'PRODUCTS',
  PROMOCODE = 'PROMOCODE',
  PAYMENT = 'PAYMENT',
  FEE = 'FEE',
}

export interface IParcel {
  productId: string;
  description?: string;
  sku: string;
  name: string;
  type?: IParcelType;
  quantity?: number;
  weight: number;
  dimension: IDimension;
  price: number;
}

export interface IDimension {
  length: number;
  width: number;
  height: number;
}

export interface ITaskAddress {
  address: IAddress;
  metadata: IMetadata;
  access: IAccess;
  updateHistories: any[];
  _id: string;
  deleted: boolean;
  type: string;
  feature: IFeature;
  updatedAt: string;
  createdAt: string;
  __v: number;
}

export interface IAccess {
  view: IView;
  edit: IView;
}

export interface IView {
  allowedAll: boolean;
  allowedCompanyId: any[];
  allowedUserId: any[];
}

export interface IMetadata {
  contact: IContact;
  convenientTime: IConvenientTime;
  timeWindow: IConvenientTime;
  autoDelete: IAutoDelete;
  distance: IDistance;
  activated: boolean;
  serviceAreas: any[];
  serviceShops: any[];
  isFromCustomer?: boolean;
  alwaysOpen?: any;
}

export interface IDistance {
  unit: string;
}

export interface IAutoDelete {
  enabled: boolean;
}

export interface IConvenientTime {
  sun: any[];
  mon: any[];
  tue: any[];
  wed: any[];
  thu: any[];
  fri: any[];
  sat: any[];
}

export interface IContact {
  email: any[];
  phone: any[];
}

export interface IFeature {
  type: string;
  geometry: IGeometry;
}

export interface IGeometry {
  type: string;
  coordinates: number[];
}

export interface IAddress {
  address: string;
  pois: string[];
  name: string;
  country: string;
  postCode: string;
  administrativeAreaLevel1: string;
  sublocalityLevel1: string;
  sublocalityLevel2: string;
}

export enum IPaymentMethod {
  PREPAID = 'PREPAID',
  POSTPAID = 'POSTPAID',
}