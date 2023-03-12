import MongooseBaseRepository from 'sendit-mongoose-repository'
import Mongoose from 'mongoose'

export const schemaDefinition = {
  consignment: { type: String, required: true },
  setId: { type: Number },
  size: {
    id: { type: Mongoose.Schema.Types.ObjectId, ref: 'Size' },
    weight: { type: Number },
    height: { type: Number },
    width: { type: Number },
    length: { type: Number },
  },
  sender: {
    name: { type: String },
    addressId: { type: String },
    address: { type: String },
    city: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    postcode: { type: String },
  },
  recipient: {
    name: { type: String },
    addressId: { type: String },
    address: { type: String },
    city: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    postcode: { type: String },
  },
  codAmount1: { type: Number },
  codAmount2: { type: Number },
  deliveryStatus: { type: String, enum: ['PICK_UP', 'DELIVER', 'RETURN'], default: 'PICK_UP' },
  pod: { type: String },
  note: { type: String },
  currentAddress: { type: String },
  extensionType: {
    type: String,
    enum: ['PARCEL', 'QRUN', 'FOOD', 'TAXI', 'DOCUMENT'],
    required: true,
  },
  referrences: { type: Object },
}

// export const schemaDefinition = {
//   trackingId: { type: String },
//   length: { type: Number },
//   width: { type: Number },
//   height: { type: Number },
//   weight: { type: Number },
//   size: { type: Number },
//   sender: {
//     address: String,
//     city: String,
//     lat: Number,
//     lng: Number,
//     name: String,
//     postcode: Number,
//     note: {
//       ref1: String, // employee 1
//       ref2: String, //  employee name
//       ref3: String, // major employee
//     },
//   },
//   recipent: {
//     address: String,
//     city: String,
//     lat: Number,
//     lng: Number,
//     name: String,
//     phone: String,
//     postcode: Number,
//     note: {
//       ref1: { type: String }, // custID
//       ref2: { type: String }, //  custName
//       ref3: { type: String }, // Indentification Type
//       ref4: { type: String }, // Indentification No
//     },
//   },
//   senderAddressId: { type: Number, required: true },
//   recipentAddressId: { type: String, required: true },
//   codAmount: { type: Number },
//   windowTime: [{ type: Date }],
//   qty: { type: Number },
//   extensionType: { type: String, enum: ['QRUN', 'FOOD', 'PARCEL', 'TAXI'], required: true },
//   note: {
//     ref1: { type: String }, // WorkOrderNo
//     ref2: { type: String }, // ACTV_NO
//     ref3: { type: String }, // Appointment Id,
//     ref4: { type: String }, // TICKET  = ticketNumber
//     ref5: { type: String }, // TICKET_REF_NO = tickerReferenceNumber
//     ref6: { type: String }, // orderNo = Order Number
//     ref7: { type: Array }, // PROD_TYPE LIST [ service  proprtype i.e. TV_PASS , TV_ACC , VOICE_PASS  ]
//     ref8: { type: String }, // CATEGORY  [ Type of Ticket  08-แจ้งเสีย , 09-ขอบริการหลังการขาย]
//     ref9: { type: String }, // PROD_ID Customer Circuit | Service no
//     ref10: { type: String }, // csfId
//     ref11: { type: String }, // csfName
//     ref12: { type: String }, // systemId
//     ref13: { type: String }, // accessType [CATV] ,
//     ref14: { type: String }, // summary  ,
//     ref15: { type: String }, // remark  note  ,

//     ref16: { type: Date }, //  Dead line
//     ref17: { type: Date }, //  AppiontTime
//     ref18: { type: String }, //  Area Code
//     ref19: { type: String }, //  Area Name

//     // SAP For Router
//     // ref20: { type: String }, // userId
//     // ref21: { type: String }, // userName
//     // ref22: { type: String }, // item Request Type Code
//     // ref23: { type: String }, // accessNo  Customer accessno [SAP Interface] ,
//     // ref24: { type: String }, // oldSn Old CPE S/N
//     // ref25: { type: String }, // SN New CPE SN
//     // ref26: { type: String }, // Bwart Movement type (Fixed, 904)
//     // ref27: { type: Date }, // PostDate
//     // ref28: { type: Date }, // DocDate
//     // ref29: { type: Date }, // Warranty
//     // ref30: { type: String }, // Menge  *** Value is 1

//     // ICC  SMC , STB Stock Management
//     ref31: { type: String }, // cu
//     ref32: { type: String }, // Device_SerailNo
//     ref33: { type: String }, // ReasonNo
//     ref34: { type: String }, // Type "Sendcommand”
//   },
// }

const builder = MongooseBaseRepository('Parcel', schemaDefinition)
export default builder.Repository
