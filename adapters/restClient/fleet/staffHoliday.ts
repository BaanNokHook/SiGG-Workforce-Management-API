export interface IStaffHoliday {
  _id: string;
  deleted: boolean;
  staffId: {
    _id: string;
  };
  type: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStaffsHoliday {
  staffId: string;
  start: string;
  end: string;
}
