import { Document, Model, SchemaDefinition, SchemaTypes } from 'mongoose';
import RepositoryBuilder from 'sendit-mongoose-repository';
export interface IQueueSccdStaffs {
  _id: any;
  task: any;
  staffs: any[];
  skills: string[];
  taskTypeGroup: string;
  areaCode: string;
  durationTime: number;
  deadline: Date;
  expireTimeAsSec: number;
  expireAt: Date;
  priority: number;
  coordinates: number[];
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
}

export const schemaDefinition: SchemaDefinition = {
  _id: {
    type: SchemaTypes.ObjectId,
  },
  task: {
    type: SchemaTypes.ObjectId,
  },
  staffs: {
    type: [SchemaTypes.ObjectId],
  },
  skills: {
    type: [SchemaTypes.ObjectId],
  },
  taskTypeGroup: {
    type: [SchemaTypes.ObjectId],
  },
  areaCode: {
    type: String,
  },
  durationTime: {
    type: Number,
  },
  deadline: {
    type: Date,
  },
  expireTimeAsSec: {
    type: Number,
  },
  expireAt: {
    type: Date,
  },
  priority: {
    type: Number,
  },
  coordinates: {
    type: [Number],
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  deleted: {
    type: Boolean,
  },
};

const builder = RepositoryBuilder('QueueSccdStaffs', schemaDefinition);
export const queueSccdStaffsModel = builder.Model as Model<
  IQueueSccdStaffs & Document
>;

export const queueSccdStaffsRepository = builder.Repository;
