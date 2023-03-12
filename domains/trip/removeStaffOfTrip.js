import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'
import { checkFindOne, isRequiredField, checkUpdate } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  await checkFindOne(tripRepository, filter)

  const tripUpdatedResp = await checkUpdate(tripRepository, filter, {
    staffs: [],
  })

  await taskRepository.model.updateMany({ _id: { $in: tripUpdatedResp.tasks } }, { staffs: [] })

  return tripUpdatedResp
}
