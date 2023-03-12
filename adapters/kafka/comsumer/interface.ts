import { MessageHeader } from '../../../libraries/kafkaBroker/consumer';

export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  REPLACE = 'replace',
  DELETE = 'delete',
  INVALIDATE = 'invalidate',
  DROP = 'drop',
  DROP_DATABASE = 'dropDatabase',
  RENAME = 'rename',
}

export interface IUpdatedFields {
  [key: string]: any;
}
export interface MessageValue<T = any> {
  _id: {
    _data: string;
  };
  operationType: OperationType;
  fullDocument: T;
  ns: { db: string; coll: string };
  documentKey: { _id: string };
  updateDescription: {
    updatedFields: IUpdatedFields;
    removedFields: string[];
  };
}
export interface MessageDeserialize {
  value: MessageValue;
  size: number;
  topic: string;
  key?: string;
  timestamp?: number;
  headers?: MessageHeader[];
  offset: number;
  partition: number;
}
