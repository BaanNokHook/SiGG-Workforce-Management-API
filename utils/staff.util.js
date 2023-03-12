import staffRepository from '../models/staff.repository'
import { upsert, findAndUpdateOrCreate, checkFind } from './domain'

export const createStaff = async (data: any) => {
  const staff = await findAndUpdateOrCreate(
    staffRepository,
    { referenceId: data.referenceId },
    { ...data, referenceId: data.referenceId },
  )
  return staff
}

export const checkStaffsRefereneceId = async ({ staffsBody, staffsOfTrip }) => {
  // staff check referenceId
  const staffsValidate = await checkFind(staffRepository, {
    referenceId: { $in: staffsBody },
  })
  // staff find id
  const staffsValidateId = staffsValidate.map(val => val._id.toString())
  const staffsValidateIdFinal =
    staffsValidateId &&
    staffsValidateId.filter(staff => {
      if (staffsOfTrip.includes(staff)) {
        return staff
      }
    })
  // logic duplicate db
  if (staffsValidateIdFinal && staffsValidateIdFinal.length > 0) {
    throw new Error(`Staff is duplicate ${staffsValidateIdFinal.toString()}`)
  }
}
