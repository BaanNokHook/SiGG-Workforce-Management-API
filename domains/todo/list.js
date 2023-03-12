import TodoRepository from '../../models/todo.repository'

type Options = {
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}
export default async (filter: any, options: Options) => {
  const response = await TodoRepository.find(filter, {
    ...options,
    page: options.page || 1,
    limit: options.limit || 5,
    ...(options && options.populate && { populate: options.populate }),
  })
  return response
}
