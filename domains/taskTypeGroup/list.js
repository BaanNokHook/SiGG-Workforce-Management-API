import TaskTypeGroupRepository from '../../models/taskTypeGroup.repository'

type Options = {
  populate?: string,
  page?: string | number,
  limit?: string | number,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any, options: Options) => {
  const response = await TaskTypeGroupRepository.find(filter, options)
  return response
}
