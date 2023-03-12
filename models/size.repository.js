import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const schemaDefinition = {
  parcelSize: { type: String },
  dimension: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  width: { type: Number },
  length: { type: Number },
  price: { type: Number },
}

const builder = MongooseBaseRepository('Size', schemaDefinition)
export default builder.Repository
