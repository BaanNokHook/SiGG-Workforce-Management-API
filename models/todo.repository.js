import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const TODO_DELIVERY_STATUS = {
  PICK_UP: 'PICK_UP',
  DELIVER: 'DELIVER',
  RETURN: 'RETURN',
  TRANSFER: 'TRANSFER',
  PROCESS: 'PROCESS',
  REPAIR: 'REPAIR',
}

const ENUM_TODO_DELIVERY_STATUS = Object.keys(TODO_DELIVERY_STATUS)

export const TODO_STATUS = {
  DONE: 'DONE',
  TODO: 'TODO',
}

const ENUM_TODO_STATUS = Object.keys(TODO_STATUS)

export const schemaDefinition = {
  sequenceSystem: { type: Number },
  sequenceManual: { type: Number },
  note: { type: String, default: null },
  description: { type: Object, default: null },
  title: { type: Object, default: null },
  action: { type: String, enum: ['CLICK', 'SLIDE'], default: 'CLICK' },
  status: { type: String, enum: ENUM_TODO_STATUS, default: TODO_STATUS.TODO, required: true },
  deliveryStatus: {
    type: String,
    enum: ENUM_TODO_DELIVERY_STATUS,
  },
  todoType: { type: Mongoose.Schema.Types.ObjectId, ref: 'TodoType', required: false },
  completedAt: { type: Date },
  taskId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Task' },
  parcels: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Parcel', required: false }],
  // passengers: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: false }],
  isRequired: { type: Boolean, default: false },
  todosRequired: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'TodoType', required: false }],
  isStart: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  isArrived: { type: Boolean, default: false },
  isAccept: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  isButton: { type: Boolean, default: false },
  isUser: { type: Boolean, default: false },
  isNotification: { type: Boolean, default: false },
  isBroadcast: { type: Boolean, default: false },
  isAutoNavigate: { type: Boolean, default: false},
  broadcastPayload: {
    payload: Object,
    strategy: String,
    timeoutPerMessage: Number,
  },
  isWebView: { type: Boolean, default: false },
  webViewPayload: {
    url: String,
  },
  tripRelate: [
    {
      fromPath: { type: Array, default: [] },
      toPath: { type: Array, default: [] },
      type: { type: String },
    },
  ],
  isRequestOptions: { type: Boolean, default: false },
  requestOptionsPayload: {
    baseURL: { type: String, default: null },
    headers: { type: Object, default: {} },
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'] },
    data: {
      fromPath: [{ type: String }],
      toPath: [{ type: String }],
    },
  },
  metadata: {
    type: Object,
  },
  isUpload: { type: Boolean, default: false },
  uploadOptions: [
    {
      fromPath: { type: Array, default: [] },
      toPath: { type: Array, default: [] },
    },
  ],
  isTrackWorkflow: { type: Boolean, default: false },
  result: { type: Object, default: null },
  value: { type: Object, default: null }, // save data for todo
  extensionFlow: { type: Mongoose.Schema.Types.ObjectId, ref: 'ExtensionFlow' },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication,
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication
}

const builder = MongooseBaseRepository('Todo', schemaDefinition)
export default builder.Repository
