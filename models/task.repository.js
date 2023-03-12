import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export const TASK_STATUS = {
  NEW: 'NEW',
  PENDING: 'PENDING',
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
}

export const TASK_DELIVERY_STATUS = {
  PICK_UP: 'PICK_UP',
  DELIVER: 'DELIVER',
  RETURN: 'RETURN',
  TRANSFER: 'TRANSFER',
  PROCESS: 'PROCESS',
  REPAIR: 'REPAIR',
}

const ENUM_TASK_DELIVERY_STATUS = Object.values(TASK_DELIVERY_STATUS)

export const ENUM_TASK_STATUS = Object.values(TASK_STATUS)

export const LIST_TASK_STATUS_CANCELLED = [
  TASK_STATUS.CANCELLED,
  TASK_STATUS.FAILED,
  TASK_STATUS.REJECTED,
]

export const TASK_STATUS_COMPLETED = [...LIST_TASK_STATUS_CANCELLED, TASK_STATUS.DONE]

export const schemaDefinition = {
  orderId: { type: String }, // orderId from oms on conductor
  tripId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  taskId: { type: String, required: true }, // pattern generate id
  sequenceSystem: { type: Number, default: 0 },
  sequenceManual: { type: Number, default: 0 },
  todos: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
  parcels: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Parcel' }],
  staffs: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  passengers: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Passenger' }],
  rejectRequest: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Reject' }],
  deliveryStatus: {
    type: String,
    enum: ENUM_TASK_DELIVERY_STATUS,
  },
  status: {
    type: String,
    enum: ENUM_TASK_STATUS,
    default: TASK_STATUS.PENDING,
  },
  detailStatus: {
    type: String,
    default: null,
  },
  statusMetadata: {
    reason: { type: String },
    note: { type: String },
  },
  windowTime: [{ type: Date }],
  startedAt: { type: Date }, // เวลาที่เริ่ม task
  acceptedAt: { type: Date },
  arrivedAt: { type: Date }, // เวลาที่ถึงหน้างาน
  completedAt: { type: Date }, // เวลาที่เสร็จสิ้น
  completedLocationId: { type: Number }, // address service when task complete!
  customer: { type: Mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  extensionType: { type: String, enum: ['QRUN', 'FOOD', 'PARCEL', 'TAXI'], required: false },
  requireSkills: [{ type: Mongoose.Schema.Types.ObjectId }], // skill ใน task นั้นๆ ที่ต้องการ
  extensionFlow: { type: Mongoose.Schema.Types.ObjectId, ref: 'ExtensionFlow' },
  tracking: [],
  track: [
    {
      todo: { type: Mongoose.Schema.Types.ObjectId, ref: 'Todo' },
      completedAt: { type: Date, default: Date.now() },
      todoTypeName: { type: String, default: '' },
    },
  ],
  note: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  /** 4pl-address referenceId */
  geographyId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Geography', default: null },
  referenceGeographyId: { type: Mongoose.Schema.Types.ObjectId, default: null },
  /** Conductor Client Id */
  workflowInstanceId: { type: String, default: null },
  workflowTaskId: { type: String, default: null },
  workflowType: { type: String, default: null },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-Authenticate relation,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-Authenticate relation,
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-Authenticate relation
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-Authenticate relation
  taskTypeId: { type: Mongoose.Schema.Types.ObjectId, ref: 'TaskType' },
  priority: { type: Number, default: 0 }, // for number mapping from config project
  appointmentNo: { type: String, default: null },
  appointmentTime: { type: Date },
  standardTimeLength: { type: String, default: null },
  information: { type: Mongoose.Schema.Types.Mixed }, //  schema decompose for QRUN true company
  remarks: [
    {
      user: { type: Mongoose.Schema.Types.ObjectId },
      message: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now() },
    },
  ],
  isRequired: { type: Boolean, default: false },
  metadata: {
    type: Object,
  },
  ruleType: { type: String, default: null},
  teamId: { type: Mongoose.Schema.Types.ObjectId, default: null},
  isWithoutReservation: { type: Boolean, default: null},
}

const builder = MongooseBaseRepository('Task', schemaDefinition, {
  indexs: [
    {
      fields: { taskId: 1, deliveryStatus: 1, status: 1 },
      options: {},
    },
  ],
})
export default builder.Repository
