import MetaDataRepository from '../../models/metaData.repository'

type Options = {
  populate?: string,
  page: string | number,
  limit: string | number,
  sort?: { [key: string]: 1 | -1 },
}

export default async (filter: any, options: Options) => {
  let populate
  if (options.populate) {
    try {
      populate = JSON.parse(options.populate)
    } catch (error) {
      populate = options.populate.split(',')
    }
  }

  const response = await MetaDataRepository.find(filter, {
    ...options,
    // page: options.page || 1,
    // limit: options.limit || 5,
    ...(options.populate && { populate }),
  })
  return response
}
