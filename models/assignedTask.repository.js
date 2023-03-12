import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const schemaDefinition = {
  taskId: { type: Mongoose.Schema.Types.ObjectId },
}

const builder = MongooseBaseRepository('AssignedTask', schemaDefinition)
export default builder.Repository
