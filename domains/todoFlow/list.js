import todoFlowRepository from '../../models/todoFlow.repository'

type Options = {
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any = {}, options: Options = { page: 1, limit: 5 }) => {
  const resp = await todoFlowRepository.find(filter, options)
  return resp
}
