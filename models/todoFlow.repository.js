import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'
import { omit } from 'ramda'
import { schemaDefinition as TodoSchemaDefinition } from './todo.repository'

const TodoSchemaDefineWithOmit = omit(
  [
    'taskId',
    'projectId',
    'companyId',
    'referenceProjectId',
    'referenceCompanyId',
    'extensionFlow',
    'result',
    'passengers',
    'parcels',
  ],
  TodoSchemaDefinition,
)

export const schemaDefinition = {
  name: { type: String, required: true },
  taskTypeId: { type: Mongoose.Schema.Types.ObjectId, ref: 'TaskType' },
  flow: [TodoSchemaDefineWithOmit],
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: true }, // 4pl-authentication reference,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: true }, // 4pl-authentication reference,
}

const builder = MongooseBaseRepository('TodoFlow', schemaDefinition)
export default builder.Repository
