import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PreProcessOptimizeDTO {
  @IsString()
  @IsOptional()
  zoneName?: string;

  @IsArray()
  areaCode!: string[];

  @IsString()
  date!: string;

  @IsString()
  @IsOptional()
  outputPath?: string;

  @IsBoolean()
  @IsOptional()
  debugMode?: boolean = false;

  @IsNumber()
  @IsOptional()
  dateOffset?: number = 0;
}
