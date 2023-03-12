export interface ICreateAppointmentRequest {
  appointmentFrom: Date;
  appointmentTo: Date;
  appointmentDate: string;
  staffId: string;
  companyId: string;
  projectId: string;
  metaData: IAppointmentMetadata;
}

export interface IChangeAppointmentRequest {
  date: Date;
  availableStaffs: IAppointmentAvailableStaff[];
  ruleType: string;
  taskTypeCode: string;
}

export interface IAppointmentAvailableStaff {
  staffId: string;
  appointmentFrom: Date;
  appointmentTo: Date;
}

export interface IAppointment {
  _id: string;
  deleted: boolean;
  appointmentFrom: Date;
  appointmentTo: Date;
  appointmentDate: string;
  staffId: string;
  companyId: string;
  projectId: string;
  metaData: IAppointmentMetadata;
  appointmentNo: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface IAppointmentMetadata {
  appointmentNo?: string;
  productOrderNo?: string;
  ruleType: string;
  taskTypeId: string;
  taskTypeCode: string;
  taskTypeGroupId: string;
  areaCode: string;
  teamId: string;
  teamName?: string;
  durationAsMinutes: number;
  isBuilding: boolean;
  saleCode?: string;
  changeMedia?: string;
}
