import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RequestType } from '../../../../domains/sccd/constants';
import {
  IAlarm,
  IContactList,
  ICustomerServiceList,
  IPropertyList,
  IWOList,
} from '../../../../domains/sccd/interface';

export class SccdRequestDto {
  @IsString()
  @IsNotEmpty()
  requestNo!: string;

  @IsString()
  @IsNotEmpty()
  systemId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayNotEmpty()
  @Type(() => WOListDto)
  woList!: WOListDto[];
}

export class SccdCancelRequestDto {
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsNotEmpty()
  workorderNo!: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  systemId?: string;

  @IsString()
  @IsOptional()
  operDate?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsOptional()
  cancelReason?: string;
}

export class WOListDto implements IWOList {
  @IsString()
  @IsNotEmpty()
  workorderNo!: string;

  @IsString()
  @IsNotEmpty()
  catalog!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  item!: string;

  @IsDateString()
  @IsNotEmpty()
  deadLine!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  areaCode!: string;

  @IsString()
  @IsNotEmpty()
  longitude!: string;

  @IsString()
  @IsNotEmpty()
  latitude!: string;

  @IsDateString()
  @IsOptional()
  startTime?: string | undefined;

  @IsOptional()
  propertyList?: IPropertyList[] | undefined;

  @IsOptional()
  contactList?: IContactList[] | undefined;

  @IsOptional()
  alarm?: IAlarm | undefined;

  @IsOptional()
  customerServiceList?: ICustomerServiceList[] | undefined;

  @IsOptional()
  summary?: string | undefined;

  @IsOptional()
  action?: string | undefined;

  @IsOptional()
  priority?: string | undefined;

  @IsOptional()
  suggest?: string | undefined;

  @IsOptional()
  address?: string | undefined;

  @IsOptional()
  addressId?: string | undefined;

  @IsOptional()
  postCode?: string | undefined;

  @IsOptional()
  ordNo?: string | undefined;

  @IsOptional()
  appointmentNo?: string | undefined;
}

export class SccdGetTeamDTO {
  @IsNotEmpty()
  @IsString()
  scabCode!: string;

  // request type code :
  // - corporate (10)
  // - network (1)
  @IsNotEmpty()
  @IsString()
  @IsIn(['corporate', '10', 'network', '1'])
  requestType!: RequestType;
}

export class SccdGetTeamConfigDTO {
  @IsNotEmpty()
  @IsString()
  @IsIn(['corporate', '10', 'network', '1'])
  requestType!: RequestType;

  @IsOptional()
  @IsString()
  scabCode?: string;

  @IsOptional()
  @IsString()
  teamCode?: string;
}

export class SccdUpdateRemarkDTO {
  @IsString()
  @IsNotEmpty()
  requestNo!: string;

  @IsString()
  @IsNotEmpty()
  workorderNo!: string;

  @IsString()
  @IsNotEmpty()
  operateDate!: string;

  @IsString()
  @IsNotEmpty()
  remarkDetail!: string;
}

export class SccdAcceptDTO {
  @IsNotEmpty()
  @IsString()
  staffId!: string;
}

export class WorkAssignmentDTO {
  @IsNotEmpty()
  @IsString()
  workorderNo!: string;
}
export class SccdGetOperationListDTO {
  @IsNotEmpty()
  @IsString()
  workorderNo!: string;

  @IsNotEmpty()
  @IsString()
  systemId!: string;
}
