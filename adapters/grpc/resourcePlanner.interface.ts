export interface ICapabilitiesRuleInput {
  teams: ITeam[];
  skills: string[];
  ruleType: string;
  startDate: string;
  endDate: string;
}

export interface IExecuteCapabilitiesRule {
  result: IExecuteCapabilitiesRuleResult;
  logs?: Object;
}

export interface IExecuteCapabilitiesRuleResult {
  availableStaffs: IAvailableStaff[];
  ruleType: string;
}

export interface IExecuteRuleCapabilitiesTransformed {
  availableStaffsGrouped: IGroupAvailableStaff[];
  availableStaffs: IAvailableStaff[];
  ruleType: string;
  teams: ITeam[];
}

export interface IGroupAvailableStaff {
  groupName: string;
  availableStaffs: IAvailableStaff[];
}

export interface IAvailableStaff {
  date: string;
  appointments: IAppointment[];
  shifts: IShift[];
  staffId: string;
  team?: ITeamOpportunity;
}

export interface IGroupTeamOpportunity {
  groupName: string;
  opportunity: IOpportunity;
  amountStaff: number;
}

export interface ITeamOpportunity {
  _id: string;
  staffIds: string[];
  name?: string;
  teamPath?: string;
  opportunity: IOpportunity;
}

export interface IOpportunity {
  initial: number;
  value: number;
  totalJob: number;
}

export interface IShift {
  date: string;
  shiftId: string;
  shiftTimes: IShiftTime[];
}

export interface IMergeShiftTime {
  shiftId: string;
  staffId: string;
  durationAsMinutes: number;
  from: string;
  to: string;
}

export enum ETimeLabel {
  'AM' = 'AM',
  'PM' = 'PM',
}

export enum ERuleType {
  'NORMAL' = 'NORMAL',
  'SPECIAL' = 'SPECIAL',
}
export interface IShiftTime {
  label?: string;
  durationAsMinutes: number;
  from: string;
  to: string;
}

export interface IAppointment {
  label?: string;
  appointmentId: string;
  appointmentNo: string;
  date: string;
  durationAsMinutes: number;
  from: string;
  staffId: string;
  to: string;
}
export interface IAddress {
  areaCode: string;
  isBuilding: boolean;
  buildingAreaCode: string;
}
export interface IFindTeamInput {
  address: IAddress;
  saleCode: string;
  taskTypeGroupId: string;
  changeMedia: string;
  events?: string[];
  teamIds?: string[];
}

export interface IExecuteFindTeamRule {
  result: IExecuteFindTeamRuleResult;
  logs?: Object;
}

export interface IExecuteFindTeamRuleResult {
  ruleType: string;
  teams: ITeam[];
}

export interface ITeam {
  _id: string;
  name?: string;
  teamPath?: string;
  staffIds: string[];
  opportunity?: IOpportunity;
}
