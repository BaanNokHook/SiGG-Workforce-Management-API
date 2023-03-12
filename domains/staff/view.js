
import StaffRepository from '../../models/staff.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const resp = await checkFindOne(StaffRepository, filter, options)
  return resp
}
