import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'
import { getFileServiceUrl, getPathFileFromUrl } from '../utils/fileService.util'

export const schemaDefinition = {
  staffSkills: [
    {
      skill: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Skills',
      },
      level: {
        type: Number,
      },
    },
  ],
  userId: {
    type: Mongoose.Schema.Types.ObjectId,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  phone: {
    type: String,
  },
  startWorkingHour: {
    type: Number,
  },
  startWorkingMinute: {
    type: Number,
  },
  citizenId: {
    type: String,
    required: true,
    unique: true,
  },
  citizenIdExpired: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  approveStatus: {
    type: String,
    enum: ['approved', 'waiting_approve', 'rejected'],
  },
  approveToken: {
    type: String,
  },
  submitApproveBy: {
    type: Mongoose.Schema.Types.ObjectId,
  },
  submitApproveAt: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  birthDay: {
    type: Date,
  },
  teamIds: [
    {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
  ],
  metaData: {
    isRequestTaxiInsurance: {
      type: Boolean,
      default: false,
    },
    isPassTraining: {
      type: Boolean,
      default: false,
    },
    formalPhoto: {
      type: String,
      get: getFileServiceUrl,
      set: getPathFileFromUrl,
    },
    bankAccountNumber: {
      type: String,
    },
    bankAccountProvider: {
      type: String,
    },
    bookBankAccountPhoto: {
      type: String,
    },
    phoneModel: {
      type: String,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactPhone: {
      type: String,
    },
    emergencyContactRelation: {
      type: String,
    },
    staffCode: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  referralCode: {
    type: String,
  },
  referralPhone: {
    type: String,
  },
  tsmReason: {
    type: String,
  },
  defaultLocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  companyId: {
    type: Mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'BUSY', 'CANCEL', 'DONE', 'PENDING'],
  },
  projectIds: [
    {
      type: Mongoose.Schema.Types.ObjectId,
    },
  ],
  heading: {
    type: Number,
  },
  availableServices: {
    type: Array,
  },
  deliveryCriteria: {
    packageSizeId: {
      type: String,
    },
    advancePaymentId: {
      type: String,
    },
    advancePaymentValue: {
      type: Number,
    },
  },
  updatedBy: {
    type: String,
  },
}

const builder = MongooseBaseRepository('Staff', schemaDefinition)
builder.Schema.set('toObject', { getters: true })
builder.Schema.set('toJSON', { getters: true })

export default builder.Repository
