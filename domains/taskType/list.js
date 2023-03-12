import TaskTypeRepository from '../../models/taskType.repository'

type Options = {
  populate?: string,
  page: string | number,
  limit: string | number,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any, options: Options) => {
  const response = await TaskTypeRepository.find(filter, {
    ...options,
    page: options.page || 1,
    limit: options.limit || 5,
  })
  return response
}
