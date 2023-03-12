import { Document, Model, SchemaDefinition } from 'mongoose';
import RepositoryBuilder from 'sendit-mongoose-repository';

export interface IPreProcessConfig {
  _id: string;
  name: string;
  type: PreProcessType;
  codes: string[];
}

enum PreProcessType {
  ASSURANCE = 'assurance',
  INSTALLATION = 'installation',
}

export const schemaDefinition: SchemaDefinition = {
  _id: {
    type: String,
  },
  name: {
    type: String,
  },
  type: {
    type: PreProcessType,
  },
  codes: {
    type: [String],
  },
};

const builder = RepositoryBuilder('PreProcessConfig', schemaDefinition);
export const preProcessConfigModel = builder.Model as Model<
  IPreProcessConfig & Document
>;
