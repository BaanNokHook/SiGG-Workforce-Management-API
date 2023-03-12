import tripRepository from '../../models/trip.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const response = await checkDelete(tripRepository, filter)
  return response
}
