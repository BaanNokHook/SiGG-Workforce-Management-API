// @flow
import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export type TaskType = {
  code: string,
  name: string,
  skills: string[],
  equipments: string[],
  taskTypeGroup: string,
  mapping: Object[],
  staffTotal: number,
  durationTime: number,
  acceptTime: number,
  warningTime: number,
  assignTime: number,
  autoSchedule: boolean,
  active: boolean,
  priority: 'High' | 'Medium' | 'Low' | 'Critical',
  todoFlowId: string,
  isRequired: boolean,
  projectId: string,
  companyId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  reference: Object,
}

export const schemaDefinition = {
  code: { type: String, index: true },
  name: { type: String },
  skills: [{ type: Mongoose.Schema.Types.ObjectId }],
  equipments: [{ type: Mongoose.Schema.Types.ObjectId }],
  taskTypeGroup: { type: Mongoose.Schema.Types.ObjectId, ref: 'TaskTypeGroup' },
  mapping: [{ type: Object }],
  staffTotal: { type: Number },
  durationTime: { type: Number },
  acceptTime: { type: Number },
  warningTime: { type: Number },
  assignTime: { type: Number },
  autoSchedule: { type: Boolean },
  active: { type: Boolean, default: true },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Critical'],
  },
  todoFlowId: { type: Mongoose.Schema.Types.ObjectId, ref: 'TodoFlow' },
  isRequired: { type: Boolean, default: true },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false },
  reference: {
    type: Object,
  },
}

const builder = MongooseBaseRepository('TaskType_test', schemaDefinition, {
  indexs: [
    {
      fields: { code: 1, projectId: 1, companyId: 1 },
      options: {},
    },
  ],
})
export default builder.Repository
