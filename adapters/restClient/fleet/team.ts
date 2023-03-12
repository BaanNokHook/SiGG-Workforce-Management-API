export interface IQRun {
  depotCode?: any;
  config: any[];
}

export interface ITeamMetadata {
  qRun: IQRun;
}

export interface ITeam {
  metadata: ITeamMetadata;
  staffIds: string[];
  deleted: boolean;
  _id: string;
  name: string;
  code: string;
  teamTypeId: string;
  projectId: string;
  zone: IZoneTeam[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string;
  __v: number;
}

export interface IZoneTeam {
  _id: string;
  zoneId: string;
  areaCode: string;
}
