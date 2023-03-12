export interface IData<T> {
  data: T[];
}

export interface IGetsResponse<T> {
  data: T;
  status: string;
  statusCodes: number;
}

export interface ITimeSlot {
  isActive: boolean;
  _id: string;
  from: string;
  to: string;
  slug: string;
}

export interface IDictStaffWithTimeSlots {
  [key: string]: ITimeSlot[];
}
