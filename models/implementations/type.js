// @flow

/** ex. find todo populate task and todo type
    populate: [{
      path: 'taskId',
      populate: [{ path: 'tripId' }, { path: 'taskTypeId' }],
    },
    {
      path: 'todoType',
    }],
   */
export type Populate = {
  path: string,
  populate?: Populate[],
}

export type Options = {
  page: number,
  limit: number,
  sort: Object,
  populate: Populate[],
}

export interface IBaseRepository {
  model: any;
  findOne(query: any, options?: { populate: Populate[] }): Promise<any>;
  find(query?: any, options?: Options): Promise<any>;
  create(data: any): Promise<any>;
  insertMany(data: any): Promise<any>;
  update(query: any, data: any): Promise<any>;
  upsert(query: any, data: any): Promise<any>;
  delete(data: any): Promise<any>;
  aggregate(aggregate: any): Promise<any>;
  aggregatePaginate(query?: any, options?: any): Promise<any>;
}
