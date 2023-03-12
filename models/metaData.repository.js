import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const schemaDefinition = {
  key: { type: String },
  title: { type: Object },
  type: { type: String, enum: ['VERTICAL', 'HORIZONTAL', 'TRACK'] },
  option: { type: String },
  textColor: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
  tagColor: { type: Object },
  customerId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  relatedKey: [{ type: Mongoose.Schema.Types.Mixed }],
}
const builder = MongooseBaseRepository('Metadata', schemaDefinition)
export default builder.Repository
