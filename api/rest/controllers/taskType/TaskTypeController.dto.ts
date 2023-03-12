import { ArrayNotEmpty, IsArray, IsOptional } from 'class-validator';
import { IGetInstallationTaskType } from '../../../../domains/taskType/taskType.interface';

export class GetInstallationTaskTypeRequest
  implements IGetInstallationTaskType {
  @ArrayNotEmpty()
  accessModes!: string[];

  @ArrayNotEmpty()
  eventCodes!: string[];

  @ArrayNotEmpty()
  productSpecCodes!: string[];

  @IsArray()
  @IsOptional()
  templates?: string[];
}
