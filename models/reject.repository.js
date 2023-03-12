import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const schemaDefinition = {
  requestBy: { type: String, required: true },
  requestRole: { type: String, required: true },
  requestDate: { type: Date, required: true },
  approveBy: { type: String },
  approveDate: { type: Date },
  referenceId: { type: String, required: true },
  referenceType: { type: String, required: true }, // Task Trip Todo
  note: { type: String },
  extensionType: { type: String },
  extensionFlow: { type: String },
  refs: { type: Mongoose.Schema.Types.Mixed },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen,
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen
}

const builder = MongooseBaseRepository('Reject', schemaDefinition)
export default builder.Repository
