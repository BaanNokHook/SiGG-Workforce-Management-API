import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Body, Controller, Get, Param, Put } from 'routing-controllers';
import { IccDomain } from '../../../domains/icc/icc.domain';

class ReferenceModelDto {
  @IsNotEmpty()
  @IsString()
  key!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;
}
class ItemDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  subtitle!: string;

  @IsNotEmpty()
  @IsBoolean()
  isEditable!: boolean;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ReferenceModelDto)
  referenceModel!: ReferenceModelDto[];

  @IsOptional()
  @IsBoolean()
  isEnableSwap!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isEnableBackup!: boolean;

  @IsOptional()
  @IsBoolean()
  isCheckedSwap!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isCheckedBackup!: boolean;

  @IsOptional()
  @IsString()
  barcode!: string;
}
export class BackupRequestDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  items!: ItemDto[];
}

export class SwapRequestDto extends BackupRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;
}

@Controller('/v1/devices/icc')
export class IccController {
  constructor(private iccDomain: IccDomain) {}

  @Get('/decoders/:tvsCustomerNo')
  async getDecoder(@Param('tvsCustomerNo') tvsCustomerNo: string) {
    const data = await this.iccDomain.getDecoders(tvsCustomerNo);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  @Put('/backup/:tvsCustomerNo')
  async backup(
    @Param('tvsCustomerNo') tvsCustomerNo: string,
    @Body() request: BackupRequestDto,
  ) {
    const data = await this.iccDomain.backup(tvsCustomerNo, request);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  @Put('/swap/:tvsCustomerNo')
  async swap(
    @Param('tvsCustomerNo') tvsCustomerNo: string,
    @Body() request: SwapRequestDto,
  ) {
    const data = await this.iccDomain.swap(tvsCustomerNo, request);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
