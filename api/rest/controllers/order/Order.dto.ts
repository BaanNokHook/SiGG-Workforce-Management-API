import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ACMODE,
  IOrderInstallationRequest,
  IOrderInstallationUpdateStatus,
  OrderInstallationStatus,
} from '../../../../domains/installation/interface';
import {
  InstallationEventCode,
  IOrderCloseRequest,
  IOrderRequest,
  ITicketVerifyRequest,
  IOrderManualRequest,
  QUEUE,
  TRUE_ORG,
} from '../../../../domains/order/interface';
import {
  TicketCloseDto,
  TicketDto,
} from '../../../../domains/ticket/ticket.dto';

export class OrderRequestDto implements IOrderRequest {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TicketDto)
  ticket!: TicketDto;
}

export class TicketVeriftRequestDto implements ITicketVerifyRequest {
  @IsString()
  ticketNo!: string;

  @IsEnum(QUEUE)
  queue!: QUEUE;

  @IsEnum(TRUE_ORG)
  org!: TRUE_ORG;
}

export class OrderInstallationRequestDto implements IOrderInstallationRequest {
  @IsString()
  @IsNotEmpty()
  taskType!: string;

  @IsString()
  @IsNotEmpty()
  teamCode!: string;

  @IsString()
  @IsOptional()
  teamName!: string;

  @IsString()
  @IsOptional()
  engCode!: string;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  contactName!: string;

  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @IsString()
  @IsOptional()
  contactPhone2!: string;

  @IsString()
  @IsNotEmpty()
  contactAddress!: string;

  @IsString()
  @IsNotEmpty()
  installationDate!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsString()
  @IsNotEmpty()
  latitude!: string;

  @IsString()
  @IsNotEmpty()
  longitude!: string;

  @IsString()
  @IsNotEmpty()
  custOrderNo!: string;

  @IsString()
  @IsNotEmpty()
  taskOrderNo!: string;

  @IsString()
  @IsNotEmpty()
  ordNo!: string;

  @IsString()
  @IsNotEmpty()
  workOrderNo!: string;

  @IsEnum(InstallationEventCode, { message: 'Invalid eventCode' })
  eventCode!: InstallationEventCode;

  @IsEnum(ACMODE, {
    message:
      'Invalid acMode value must be "FTTH", "FTTB", "FTTC", "FTTC-DOCSIS"',
  })
  @IsNotEmpty()
  acMode!: ACMODE;

  @IsOptional()
  metaData!: any;
}

export class OrderInstallationUpdateStatusRequestDto
  implements IOrderInstallationUpdateStatus {
  @IsEnum(OrderInstallationStatus)
  @IsNotEmpty()
  status!: OrderInstallationStatus;

  @IsString()
  @IsOptional()
  arriveTime!: string;

  @IsString()
  @IsOptional()
  deadlineTime!: string;
}

export class OrderCloseDto implements IOrderCloseRequest {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TicketCloseDto)
  ticket!: TicketCloseDto;
}

export class OrderManualDto implements IOrderManualRequest {
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  areaCode!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  taskTypeId!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsString()
  @IsNotEmpty()
  systemId!: string;

  @IsString()
  @IsNotEmpty()
  room!: string;

  @IsString()
  @IsNotEmpty()
  serverEvent!: string;

  @IsString()
  @IsNotEmpty()
  clientEvent!: string;
}
