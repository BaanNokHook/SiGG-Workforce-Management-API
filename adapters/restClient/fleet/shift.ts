export interface IShiftTime {
  from: Date;
  to: Date;
  isActive: boolean;
}

export interface ITimeSlot {
  isActive: boolean;
  _id: string;
  from: string;
  to: string;
  slug: string;
}

export interface IShift {
  _id: string;
  name: string;
  shiftTime: IShiftTime[];
  companyId: string;
  projectId: string;
  updatedAt: Date;
  createdAt: Date;
  taskTypeIds: any[];
  timeslot: ITimeSlot[];
  color: string;
  type: string;
}

export interface IStaffWorkHourDetail {
  staffId: string;
  timeSlots: ITimeSlot[];
  startWorkAt: number;
  endWorkAt: number;
}

export interface IDictStaffWorkHourDetail {
  [key: string]: IStaffWorkHourDetail;
}
