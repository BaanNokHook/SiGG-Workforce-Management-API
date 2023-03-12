export interface IStaffShift {
  shiftDate: string[];
  individualShiftDate: any[];
  isNormalShift: boolean;
  isCheckedIn: boolean;
  deleted: boolean;
  _id: string;
  staffId: string;
  date: Date;
  projectId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Data {
  data: IStaffShift[];
  total: number;
  limit: number;
  page: number;
  hasNext: boolean;
}

export interface RootObject {
  data: Data;
  status: string;
  statusCodes: number;
}

export interface IDictStaffWithShiftDates {
  [key: string]: IStaffShift[];
}

export function convertStaffShiftToDictStaffWithShiftDates(
  staffShifts: IStaffShift[],
): IDictStaffWithShiftDates {
  let dict: IDictStaffWithShiftDates = {};
  for (const staffShift of staffShifts) {
    if (!dict[staffShift.staffId]) {
      dict[staffShift.staffId] = [] as IStaffShift[];
    }

    dict[staffShift.staffId].push(staffShift);
  }

  return dict;
}
