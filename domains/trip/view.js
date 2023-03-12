import tripRepository from '../../models/trip.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any = {}, options: any = {}) => {
  isRequiredField(filter, validate)
  const response = await checkFindOne(tripRepository, filter, {
    ...(options.populate && { populate: options.populate }),
  })

  return response
}
