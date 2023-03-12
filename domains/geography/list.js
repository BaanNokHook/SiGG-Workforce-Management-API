import GeographyRepository from '../../models/geography.repository'

type Options = {
  page: string | number,
  limit: string | number,
  populate?: string,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any, options: Options) => {
  const resp = await GeographyRepository.find(filter, {
    ...options,
    page: options.page || 1,
    limit: options.limit || 5,
  })
  return resp
}
