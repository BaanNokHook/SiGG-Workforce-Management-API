import TodoTypeRepository from '../../models/todoType.repository'

type Options = {
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}
export default async (filter: any, options: Options) => {
  const response = await TodoTypeRepository.find(filter, {
    ...options,
    page: options.page || 1,
    limit: options.limit || 5,
    ...(options && options.populate && { populate: options.populate }),
  })
  return response
}

export const listDistinctTodoType = async (key: string, options: Options) => {
  const response = await TodoTypeRepository.find(
    {},
    {
      ...options,
      page: options.page || 1,
      limit: options.limit || 5,
      ...(options && options.populate && { populate: options.populate }),
      distinct: key,
    },
  )
  return response
}
