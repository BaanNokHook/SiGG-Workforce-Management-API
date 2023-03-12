import GeographyRepository from '../../models/geography.repository'
import { checkUpdate, checkFindOne } from '../../utils/domain'

export default async (filter: any, data: any) => {
  await checkFindOne(GeographyRepository, filter)
  const resp = await checkUpdate(GeographyRepository, filter, data)
  return resp
}
