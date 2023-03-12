import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const schemaDefinition = {
  code: { type: String },
  name: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
  icon: { type: String, default: null },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false },
}

const builder = MongooseBaseRepository('TaskTypeGroup', schemaDefinition)
export default builder.Repository
