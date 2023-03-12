// @flow
import tripRepository from '../../models/trip.repository'
import logger from '../../libraries/logger'
import taskRepository from '../../models/task.repository'
import staffRepository from '../../models/staff.repository'
import { checkUpdate, checkFindOne, isRequiredField } from '../../utils/domain'
import { TripStatus } from '../../constants/trip'

type RequestFleetUpdateStaffToTripDTO = {
  staff: {
    _id: string,
  },
  metadata?: {
    workflowInstanceId: string,
    taskId: string,
  },
}

const validate = { tripId: true, staff: true }

export default async (tripId: string, data: RequestFleetUpdateStaffToTripDTO) => {
  isRequiredField({ tripId, ...data }, validate)

  const trip = await checkFindOne(tripRepository, { _id: tripId })
  logger.info({ event: 'add_staff_to_trip_and_update_metadata', tripId }, data)

  const { staff } = data
  const newStaff = await staffRepository.upsert(
    { _id: staff._id },
    { ...staff, referenceId: staff._id },
  )

  let tripUpdated = {}

  if (trip.extensionType === 'TAXI') {
    const dataToUpdate = {
      metadata: { ...trip.metadata, ...data.metadata },
      status: TripStatus.DOING,
      $addToSet: { staffs: newStaff._id },
    }
    tripUpdated = await checkUpdate(tripRepository, { _id: tripId }, dataToUpdate)
  } else {
    tripUpdated = await tripRepository.update(
      { _id: tripId },
      { ...data, $addToSet: { staffs: newStaff._id } },
    )
  }

  await taskRepository.model.updateMany(
    { _id: { $in: trip.tasks } },
    { $addToSet: { staffs: newStaff._id } },
  )

  return tripUpdated
}
