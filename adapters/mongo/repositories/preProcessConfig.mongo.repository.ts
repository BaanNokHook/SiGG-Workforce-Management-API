import { Service } from 'typedi';
import {
  IPreProcessConfig,
  preProcessConfigModel,
} from '../models/preProcessConfig.model';

@Service('PreProcessConfigRepository')
export class PreProcessConfigRepository {
  async findByName(name: string): Promise<IPreProcessConfig | null> {
    const result = await preProcessConfigModel.findOne({
      name,
    });
    return result?.toObject();
  }
}
