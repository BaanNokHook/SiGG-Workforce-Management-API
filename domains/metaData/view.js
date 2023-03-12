import MetaDataRepository from '../../models/metaData.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const response = await checkFindOne(MetaDataRepository, filter, options)
  return response
}
