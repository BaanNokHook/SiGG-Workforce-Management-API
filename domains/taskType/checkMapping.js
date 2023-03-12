import * as R from 'ramda'
// import mongoose from 'mongoose'
import TaskTypeRepository from '../../models/taskType.repository'
import ThrowError from '../../error/taskType'

const alreadyExistThrowError = async (repo, filter) => {
  const obj = await repo.findOne(filter)
  if (obj) throw ThrowError.ALREADY_EXIST_MAPPING(filter)
  return true
}

// const mappingObjectIdInTaskTypeMapping = async mappingTypes => {
//   const {
//     Types: { ObjectId },
//   } = mongoose
//   return R.map(
//     mappingType =>
//       R.reduce(
//         (obj, key) => {
//           let newObj = { ...obj }
//           const value = mappingType([key])
//           if (R.type(value) === 'String' && ObjectId.isValid(value)) {
//             newObj = { ...newObj, [key]: ObjectId(value) }
//           }
//           return newObj
//         },
//         {},
//         Object.keys(mappingType),
//       ),
//     mappingTypes,
//   )
// }

export default async (mappingTypes = [], projectId, companyId, taskTypeId = null) => {
  const resp = await Promise.all(
    R.map(async mappingType => {
      const isNotExist = await alreadyExistThrowError(TaskTypeRepository, {
        _id: { $ne: taskTypeId },
        projectId,
        companyId,
        mapping: {
          $elemMatch: {
            ...mappingType,
          },
        },
      })
      return isNotExist
    }, mappingTypes),
  )
  return resp
}
