import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

const EXTENSION_TYPE = ['QRUN', 'FOOD', 'PARCEL', 'TAXI', 'DOCUMENT']
const DELIVERY_STATUS = ['PICK_UP', 'DELIVER', 'RETURN', 'TRANSFER', 'PROCESS', 'REPAIR']

const todosSchema = {
  title: { type: String },
  note: String,
  sequenceSystem: { type: Number },
  sequenceManual: { type: Number },
  value: { type: Object, default: null },
  todoType: { type: Mongoose.Schema.Types.ObjectId, ref: 'TodoType' },
  isUser: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false },
  isStart: { type: Boolean, default: false }, // isStart = Flag is start task then change status of task = "DOING", trip = "DOING"
  isLast: { type: Boolean, default: false }, // isLast = Flag is end task then change status of task = "DONE" In case the last task of trip will change status of trip = DONE
  isNotification: { type: Boolean, default: false },
  isBroadcast: { type: Boolean, default: false },
  isAutoNavigate: { type: Boolean, default: false },
  broadcastPayload: {
    payload: { type: Object, default: {} },
    strategy: { type: String, default: null },
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
      type: { type: String, default: null },
    },
  ],
  isAccept: { type: Boolean, default: false }, // isAccept = Flag is accept task then change status of task = "TODO"
  isHidden: { type: Boolean, default: false },
  isButton: { type: Boolean, default: false },
  action: { type: String, enum: ['CLICK', 'SLIDE'], default: 'CLICK' },
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
  isUpload: { type: Boolean, default: false },
  uploadOptions: [
    {
      fromPath: { type: Array, default: [] },
      toPath: { type: Array, default: [] },
    },
  ],
  isTrackWorkflow: { type: Boolean, default: false },
}

const closeListSchema = {
  title: {
    type: Object,
    default: null,
  },
  default: { type: Boolean, default: false },
  isUser: { type: Boolean, default: false },
  isDriver: { type: Boolean, default: false },
}

export const schemaDefinition = {
  name: { type: String, required: true },
  title: { type: String, required: true },
  active: { type: Boolean, default: true },
  description: { type: String },
  extensionType: { type: String, enum: EXTENSION_TYPE },
  companyId: { type: Mongoose.Schema.Types.ObjectId },
  projectId: { type: Mongoose.Schema.Types.ObjectId },
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId },
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId },
  customer: { type: Mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleTypes: [{ type: String }],
  orderReturn: [closeListSchema],
  orderReject: [closeListSchema],
  tripRequired: {
    cutOffTime: {
      active: { type: Boolean, default: false },
      time: { type: String },
    },
    isShop: {
      active: { type: Boolean, default: false },
    },
    isDriver: {
      active: { type: Boolean, default: false },
      criteria: {
        type: Mongoose.Schema.Types.Mixed,
      },
      broadcastConfig: {
        type: Object,
      },
      vehicleType: { type: String },
      'staffSkills.skill': [{ type: Mongoose.Schema.Types.ObjectId }],
    },
    isSameDay: {
      active: { type: Boolean, default: false },
    },
    isNextDay: {
      active: { type: Boolean, default: false },
      total: { type: Number },
    },
    isAcceptTask: {
      active: { type: Boolean, default: false },
      timeStart: { type: String },
      timeEnd: { type: String },
    },
    isStartTask: {
      active: { type: Boolean, defualt: false },
      strategy: { type: String, enum: ['SINGLE', 'MULTIPLE'], default: 'SINGLE' },
    },
  },
  taskRequired: [
    {
      deliveryStatus: { type: String, enum: DELIVERY_STATUS },
      isRequired: { type: Boolean, default: false },
      option: { type: Object, default: null },
      todos: [todosSchema],
    },
  ],
}

const builder = MongooseBaseRepository('ExtensionFlow', schemaDefinition)
export default builder.Repository
