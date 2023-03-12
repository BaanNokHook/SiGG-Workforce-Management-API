import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const TRIP_STATUS = {
  PENDING: 'PENDING',
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
  PARTIAL_DONE: 'PARTIAL_DONE',
}

const ENUM_TRIP_STATUS = Object.keys(TRIP_STATUS)

export const LIST_TRIP_STATUS_FAILED = [
  TRIP_STATUS.CANCELLED,
  TRIP_STATUS.FAILED,
  TRIP_STATUS.REJECTED,
]

export const TRIP_STATUS_COMPLETED = [
  ...LIST_TRIP_STATUS_FAILED,
  TRIP_STATUS.DONE,
  TRIP_STATUS.PARTIAL_DONE,
  TRIP_STATUS.CLOSED,
]

export const schemaDefinition = {
  orderId: { type: String, index: true }, // orderId from oms on conductor
  orderReferenceId: { type: String, index: true },
  tripId: { type: String, required: true },
  note: { type: String },
  windowTime: [{ type: Date, index: true }], // เวลาที่สามารถรับงาน
  startedAt: { type: Date }, // เวลาที่เริ่ม trip
  completedAt: { type: Date }, // เวลาที่จบ trip
  detailStatus: {
    type: String,
  },
  detailStatusMetadata: {
    todoId: { type: String },
    todoTypeCode: { type: String },
    taskId: { type: String },
    taskTypeCode: { type: String },
    refOrderStatuses: [
      {
        refOrderId: {
          type: String,
        },
        status: {
          type: String,
          enum: ENUM_TRIP_STATUS,
        },
      },
    ],
  },
  status: {
    type: String,
    index: true,
    enum: ENUM_TRIP_STATUS,
    default: TRIP_STATUS.PENDING,
  },
  passengers: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Passenger' }],
  staffs: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  tasks: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }],
  rejectRequest: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Reject' }],
  extensionType: { type: String, enum: ['QRUN', 'FOOD', 'PARCEL', 'TAXI'] },
  customer: { type: Mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
  income: { type: Number, default: 0 },
  directions: [
    {
      referenceGeographyId: { type: Mongoose.Schema.Types.ObjectId, default: null },
      geographyId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Geography', default: null },
      createdAt: { type: Date, default: Date.now() },
    },
  ],
  rating: { type: Object, default: {} },
  /** Conductor Client Id */
  workflowInstanceId: { type: String, default: null },
  workflowTaskId: { type: String, default: null },
  workflowType: { type: String, default: null },
  payment: {
    incentive: Object,
    // EX.PREPAID,POSTPAID
    method: String,
    // Ex.True Money, Credit, Debit Card
    description: String,
    coupon: String,
    currency: String,
    // total parcels price
    amount: Number,
    // total extra cod
    extraCODAmount: Number,
    detailService: {
      serviceFee: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount: Number,
      coupon: Number,
      fare: Number,
      expressWayFare: Number,
      // !short term get this value from project.contract.config.driver.fee|bonus
      // !long term this value should get from price-management-service
      driver: {
        fee: Number,
        bonus: Number,
        total: Number, // fee + bonus
        holdWallet: Number, // amount + deliveryFee + serviceFee
      },
    },
  },
  priceIncentive: {
    cost: [{ type: { type: String }, cost: { type: Number } }],
    sumCost: { type: Number },
    fixedCost: { type: Number },
    minCost: { type: Number },
    maxCost: { type: Number },
    fee: { type: Number },
    transactionConfigId: { type: String },
    transactionCostId: { type: String },
  },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false, index: true }, // 4pl-authen,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false, index: true }, // 4pl-authen,
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authen
  metadata: {
    type: Object,
    default: null,
  },
  pickedUpTime: { type: Date, index: true },
  deliveredTime: { type: Date, index: true },
}

const builder = MongooseBaseRepository('Trip', schemaDefinition, {
  indexs: [
    {
      fields: {  status: 1, createdAt: 1, staffs: 1 },
      options: {},
    },
    {
      fields: { 'metadata.orderId': 1 },
      options: {},
    },
  ],
})
export default builder.Repository
