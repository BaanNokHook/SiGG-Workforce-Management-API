// @flow
type SearchQuery = {
  startTime: string,
  endTime: string,
  staffs: string[],
  areaCodes: string[],
  companyId: string,
  projectId: string,
  [key: string]: any,
}

type SearchOption = {
  limit: number,
  page: number,
  selectedFields: {
    [key: string]: number,
  },
}

export type SearchInput = {
  bodyRequest: SearchQuery,
  options: SearchOption,
}
