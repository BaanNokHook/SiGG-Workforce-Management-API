import GeographyRepository from '../../models/geography.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const resp = await checkDelete(GeographyRepository, filter)
  return resp
}
