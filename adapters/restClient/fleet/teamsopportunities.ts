export interface ITeamsOpportunities {
  totalJob: number;
  areaCode: string;
  taskTypeGroupId: string;
  teams: IOpportunityTeam[];
}

export interface IOpportunityTeam {
  initial: number;
  totalJob: number;
  opportunity: number;
  teamId: string;
  childTeamIds?: string[];
}
