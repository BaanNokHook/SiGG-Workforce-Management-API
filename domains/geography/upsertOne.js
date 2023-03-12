import geographyRepository from '../../models/geography.repository'
import { findAndUpdateOrCreate } from '../../utils/domain'

export default async (geography: any) => {
  const newGeography = await findAndUpdateOrCreate(
    geographyRepository,
    { $or: [{ _id: geography._id }, { referenceGeographyId: geography._id }] },
    { ...geography, referenceGeographyId: geography._id },
  )
  return newGeography
}
