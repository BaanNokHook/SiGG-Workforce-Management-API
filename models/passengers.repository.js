import { path } from 'ramda'
import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const schemaDefinition = {
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  gender: { type: String, enum: ['MALE', 'FEMALE'] },
  userId: { type: Mongoose.Schema.Types.ObjectId },
  profileImg: { type: String },
}

const builder = MongooseBaseRepository('Passenger', schemaDefinition)

builder.Repository.bulkUpsert = async (filter: Array<string>, Passengers: Array<any>) => {
  const prepareData = Passengers.map(val => {
    const _filter = filter.reduce(
      (obj, key) => ({
        [key]: path([key], val),
      }),
      {},
    )

    return {
      updateOne: {
        filter: _filter,
        update: { $set: { ...val, userId: val._id } },
        upsert: true,
      },
    }
  })
  const bulkExec = await builder.Repository.model.bulkWrite(prepareData)
  return bulkExec
}

export default builder.Repository
