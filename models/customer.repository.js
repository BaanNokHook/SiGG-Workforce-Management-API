import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

const dcScheme = {
  name: String,
  referenceGeographyId: Mongoose.Schema.Types.ObjectId,
  address: String,
  city: String,
  lat: Number,
  lng: Number,
  phone: String,
  postcode: String,
}

export const schemaDefinition = {
  code: { type: String, required: true },
  name: { type: String, required: true },
  referenceGeographyId: { type: Mongoose.Schema.Types.ObjectId },
  description: { type: Mongoose.Schema.Types.Mixed },
  status: { type: Mongoose.Schema.Types.Mixed },
  /** referenceId from 4pl-auth of company , But now still use string code_name company */
  size: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Size' }],
  // extensionsFlow: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'ExtensionFlow' }],
  email: { type: String },
  phone: { type: String },
  // todosType: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'TodoType' }],
  // shops: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
  // dc: [dcScheme],
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false },
}

const builder = MongooseBaseRepository('Customer', schemaDefinition)
export default builder.Repository
