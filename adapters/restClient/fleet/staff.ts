import { IStaffWorkHourDetail } from './shift';

export interface IStaffWithTeamCode extends IStaffWorkHourDetail {
  _id: string;
  defaultLocation: ILocation;
  teamCodes: string[];
}

export interface IStaffMetaData {
  isRequestTaxiInsurance: boolean;
  isPassTraining: boolean;
  formalPhoto: string;
  staffCode: string;
  drivings: any[];
}

export interface ILocation {
  coordinates: number[];
  type: string;
}

export interface ISkill {
  _id: string;
  skill: string;
  level: number;
}

export interface IStaff {
  metaData: IStaffMetaData;
  defaultLocation: ILocation;
  location: ILocation;
  teamIds: string[];
  projectIds: string[];
  availableServices: any[];
  deleted: boolean;
  _id: string;
  citizenId: string;
  __v: number;
  approveStatus: string;
  companyId: string;
  createdAt: Date;
  gender: string;
  referralCode: string;
  status: string;
  updatedAt: Date;
  userId: string;
  staffSkills: ISkill[];
  firstname: string;
  lastname: string;
  phone?: string;
}
