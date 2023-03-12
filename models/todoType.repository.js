// @flow
import Mongoose from 'mongoose'
import MongooseBaseRepository from 'sendit-mongoose-repository'

export type TodoType = {
  broadcastPayload: { payload: null, strategy: null, timeoutPerMessage: number },
  webViewPayload: { url: null },
  requestOptionsPayload: { data: { fromPath: [], toPath: [] }, baseURL: null },
  responseMessages: {
    success: {
      fromPath: string[],
      title: { th: string },
      message: { th: string },
    },
    failure: {
      fromPath: [],
      title: { th: string },
      message: { th: string },
    },
  },
  extensionType: [],
  isRequestOptions: boolean,
  isUpload: boolean,
  deleted: boolean,
  _id: string,
  title: { th: string },
  name: string,
  code: string,
  description: { th: string },
  companyId: string,
  projectId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  tripRelate: [],
  updatedAt: Date,
  createdAt: Date,
}

export const schemaDefinition = {
  code: { type: String, index: true },
  name: { type: String, required: true },
  description: { type: Object },
  color: { type: String },
  icon: { type: String },
  title: { type: Object },
  extensionType: [{ type: String, enum: ['QRUN', 'FOOD', 'PARCEL', 'TAXI', 'ALL', 'DOCUMENT'] }],
  customer: { type: Mongoose.Schema.Types.ObjectId },
  broadcastPayload: {
    payload: { type: Object, default: null },
    strategy: { type: String, default: null },
    timeoutPerMessage: { type: Number, default: 0 },
  },
  webViewPayload: {
    url: { type: String, default: null },
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
  isUpload: { type: Boolean, default: false },
  uploadOptions: [
    {
      fromPath: { type: Array, default: [] },
      toPath: { type: Array, default: [] },
    },
  ],
  responseMessages: {
    success: {
      fromPath: { type: Array, default: [] },
      title: { type: Object, default: null },
      message: { type: Object, default: null },
    },
    failure: {
      fromPath: { type: Array, default: [] },
      title: { type: Object, default: 'Alert' },
      message: { type: Object, default: 'Something wrong' },
    },
  },
  extensionFlow: { type: Mongoose.Schema.Types.ObjectId, ref: 'ExtensionFlow' },
  projectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication,
  companyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication,
  referenceProjectId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication
  referenceCompanyId: { type: Mongoose.Schema.Types.ObjectId, required: false }, // 4pl-authentication
}

const builder = MongooseBaseRepository('TodoType', schemaDefinition)
export default builder.Repository
