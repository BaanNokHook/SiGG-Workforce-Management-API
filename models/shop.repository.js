import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const schemaDefinition = {
  shopCode: { type: Number },
  customer: { type: Mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  name: { type: String },
  addressId: { type: String },
  phone: { type: String },
}

const builder = MongooseBaseRepository('Shop', schemaDefinition)
export default builder.Repository
