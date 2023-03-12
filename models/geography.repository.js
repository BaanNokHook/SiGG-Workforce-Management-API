// @flow
import { path } from 'ramda'
import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const schemaDefinition = {
  name: { type: Mongoose.Schema.Types.Mixed },
  type: { type: Mongoose.Schema.Types.Mixed },
  address: { type: Mongoose.Schema.Types.Mixed },
  feature: { type: Mongoose.Schema.Types.Mixed },
  metadata: {
    type: Mongoose.Schema.Types.Mixed,
  },
  owner: {
    type: Mongoose.Schema.Types.Mixed,
  },
  access: { type: Mongoose.Schema.Types.Mixed },
  updateHistories: { type: Mongoose.Schema.Types.Mixed },
  referenceGeographyId: { type: Mongoose.Schema.Types.ObjectId, unique: false }, // referneceId 4pl-address-zoning
}

const builder = MongooseBaseRepository('Geography', schemaDefinition)

builder.Repository.bulkUpsert = async (filter: Array<string>, Geography: Array<any>) => {
  const prepareData = Geography.map(val => {
    const _filter = filter.reduce(
      (obj, key) => ({
        [key]: path([key], val),
      }),
      {},
    )

    return {
      updateOne: {
        filter: _filter,
        update: { $set: { ...val, referenceGeographyId: val._id } },
        upsert: true,
      },
    }
  })
  const bulkExec = await builder.Repository.model.bulkWrite(prepareData)
  return bulkExec
}

export default builder.Repository
