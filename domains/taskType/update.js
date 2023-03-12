import * as R from 'ramda'
import TaskTypeRepository from '../../models/taskType.repository'
import { checkUpdate, checkFindOne, alreadyExistThrowError } from '../../utils/domain'
import checkMapping from './checkMapping'

// const justifyRequestTypeMapping = (currentMapping, newRequestType) => {
//   const newMapping = R.map(
//     mappingType => ({
//       ...mappingType,
//       requestType: newRequestType,
//     }),
//     currentMapping,
//   )
//   return newMapping
// }

// const justifyUpdateRequestTypeData = async (currentTaskType, updateData) => {
//   const newRequestType = R.path(['requestType'], updateData)
//   const currentMapping = R.pathOr([], ['mapping'], currentTaskType)
//   const currentRequestType = R.pipe(R.path(['requestType']), R.toString)(currentTaskType)
//   if (
//     !R.isEmpty(currentMapping) &&
//     !R.isNil(newRequestType) &&
//     !R.isNil(currentRequestType) &&
//     !R.equals(currentRequestType, newRequestType)
//   ) {
//     const mapping = justifyRequestTypeMapping(currentMapping, newRequestType)
//     await checkMapping(mapping)
//     return { ...updateData, mapping }
//   }
//   return updateData
// }

const checkDuplicateTaskTypeCodeAndName = async (filter = {}, data = {}) => {
  const code = R.pathOr(null, ['code'], data)
  const name = R.pathOr(null, ['name'], data)
  const projectId = R.pathOr(null, ['projectId'], data)
  const companyId = R.pathOr(null, ['companyId'], data)
  const _id = R.pathOr(null, ['_id'], filter)
  await alreadyExistThrowError(TaskTypeRepository, {
    projectId,
    companyId,
    $or: [{ code, _id: { $ne: _id } }, { name, _id: { $ne: _id } }],
  })
}

export default async (filter: any, data: any) => {
  const { mapping, projectId, companyId } = data
  const { _id: taskTypeId } = filter
  await checkFindOne(TaskTypeRepository, filter)
  await checkDuplicateTaskTypeCodeAndName(filter, data)
  if (mapping) {
    await checkMapping(mapping, projectId, companyId, taskTypeId)
  }
  // const updateData = R.path(['requestType'], data)
  //   ? await justifyUpdateRequestTypeData(currentTaskType.toObject(), data)
  //   : data
  const taskTypeUpdate = await checkUpdate(TaskTypeRepository, filter, data)
  return taskTypeUpdate
}
