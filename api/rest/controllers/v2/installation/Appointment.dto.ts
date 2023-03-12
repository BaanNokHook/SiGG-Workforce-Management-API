import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  Validate,
  ValidateNested
} from 'class-validator';
import {
  AccessMode,
  CanChange,
  IAppointmentTime,
  IInquiryResult,
  IListAppointmentCapabilitiesRequest,
  IListAppointmentCapabilitiesResponse,
  IListAppointmentSlotsRequest,
  IListOrdersAllowToChangeRequest,
  IListOrdersAllowToChangeResponse,
  IReAppointmentRequest,
  IReserveOrChangeAppointmentRequest,
  IReserveOrChangeAppointmentResponse,
  IServiceChangeInstallation,
  ITemplate,
  ITimeSlotInstallation,
  IUndoAppointmentRequest,
  IUndoAppointmentResponse,
  TimeSlot
} from '../../../../../domains/installation/appointment.interface';
import {
  IsAfterCurrentDate,
  IsDateFormat,
  IsTimeSlot
} from '../../../../../utils/validations';
import isStringNotStartOrEndWithComma from '../../../../../utils/validations/isStringNotStartOrEndWithComma';

export class ListAppointmentCapabilitiesRequestDto
  implements IListAppointmentCapabilitiesRequest {
  @IsNotEmpty()
  @IsString()
  @Validate(IsDateFormat)
  INSTALLATION_DATE!: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AccessMode)
  ACCESS_MODE!: string;

  @IsNotEmpty()
  @IsString()
  PROD_SPEC_CODE!: string;

  @IsNotEmpty()
  @IsString()
  ADDRESS_ID!: string;

  @IsInt()
  @Min(1)
  @Max(60)
  DAYS!: number;

  @IsString()
  @IsOptional()
  CUST_ORDER_NBR?: string;

  @IsString()
  @IsOptional()
  ORDER_NBR?: string;

  @IsString()
  @IsOptional()
  CHANGE_MEDIA?: string;

  @IsString()
  @IsOptional()
  SALE_CODE?: string;

  @ValidateNested({ each: true })
  @Type(() => ServiceChangeInstallation)
  @ArrayNotEmpty()
  CHANGE_SERVICE!: ServiceChangeInstallation[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Template)
  TEMPLATE?: Template[];
}

class Template implements ITemplate {
  @IsNotEmpty()
  @IsString()
  TEMPLATE_ID!: string;

  @IsNotEmpty()
  @IsString()
  PROD_SPEC_CODE!: string;
}

export class ListAppointmentCapabilitiesResponseDto
  implements IListAppointmentCapabilitiesResponse {
  @IsNotEmpty()
  @IsString()
  RESULT_CODE!: string;

  @IsNotEmpty()
  @IsString()
  RESULT_DESC!: string;

  @IsNotEmpty()
  @IsString()
  RULE_TYPE!: string;

  @ValidateNested({ each: true })
  @Type(() => TimeSlotInstallation)
  @ArrayNotEmpty()
  TIME_SLOT_LIST!: TimeSlotInstallation[];
}

class TimeSlotInstallation implements ITimeSlotInstallation {
  @IsNotEmpty()
  @IsString()
  APPOINTMENT_DATE!: string;

  @IsNotEmpty()
  @IsString()
  TIME_SLOT!: string;

  @IsNotEmpty()
  @IsString()
  INSTALLATION_CAPACITY!: string;
}
class ServiceChangeInstallation implements IServiceChangeInstallation {
  @IsNotEmpty()
  @IsString()
  PROD_SPEC_CODE!: string;

  @IsNotEmpty()
  @IsString()
  EVENT_CODE!: string;

  @IsString()
  @IsOptional()
  PARAM1?: string;

  @IsString()
  @IsOptional()
  PARAM2?: string;

  @IsString()
  @IsOptional()
  PARAM3?: string;
}

class AppointmentTime implements IAppointmentTime {
  @IsString()
  @IsNotEmpty()
  @Validate(IsDateFormat)
  @Validate(IsAfterCurrentDate)
  APPOINTMENT_DATE!: string;

  @IsNotEmpty()
  @IsEnum(TimeSlot)
  @Validate(IsTimeSlot)
  TIME_SLOT!: string;
}

export class ReserveOrChangeAppointmentRequestDto
  implements IReserveOrChangeAppointmentRequest {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AppointmentTime)
  APPOINTMENT_TIME!: AppointmentTime;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AccessMode)
  ACCESS_MODE!: string;

  @IsString()
  @IsNotEmpty()
  PROD_SPEC_CODE!: string;

  @IsString()
  @IsNotEmpty()
  ADDRESS_ID!: string;

  @IsString()
  @IsOptional()
  CUST_ORDER_NBR?: string;

  @IsString()
  @IsOptional()
  ORDER_NBR?: string;

  @IsString()
  @IsOptional()
  CHANGE_MEDIA?: string;

  @IsString()
  @IsOptional()
  SALE_CODE?: string;

  @ValidateNested({ each: true })
  @Type(() => ServiceChangeInstallation)
  @ArrayNotEmpty()
  CHANGE_SERVICE!: ServiceChangeInstallation[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Template)
  TEMPLATE?: Template[];
}

export class ReserveOrChangeAppointmentResponseDto
  implements IReserveOrChangeAppointmentResponse {
  @IsNotEmpty()
  @IsString()
  RESULT_CODE!: string;

  @IsNotEmpty()
  @IsString()
  RESULT_DESC!: string;

  @IsNotEmpty()
  @IsString()
  RULE_TYPE!: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  WF_RESERVATION_ID!: string;
}

export class UpdoAppointmentRequestDto implements IUndoAppointmentRequest {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  WF_RESERVATION_ID!: string;
}

export class UpdoAppointmentResponseDto implements IUndoAppointmentResponse {
  @IsNotEmpty()
  @IsString()
  RESULT_CODE!: string;

  @IsNotEmpty()
  @IsString()
  RESULT_DESC!: string;
}

export class ListOrdersAllowToChangeRequestDto
  implements IListOrdersAllowToChangeRequest {
  @IsNotEmpty()
  @IsString()
  @Validate(isStringNotStartOrEndWithComma)
  ORDER_NBR_SET!: string;
}

export class ListOrdersAllowToChangeResponseDto
  implements IListOrdersAllowToChangeResponse {
  @IsNotEmpty()
  @IsString()
  RESULT_CODE!: string;

  @IsNotEmpty()
  @IsString()
  RESULT_DESC!: string;

  @ValidateNested({ each: true })
  @Type(() => InquiryResult)
  @ArrayNotEmpty()
  INQUIRY_RESULT!: InquiryResult[];
}

class InquiryResult implements IInquiryResult {
  @IsNotEmpty()
  @IsString()
  ORDER_NBR!: string;

  @IsNotEmpty()
  @IsEnum(CanChange)
  CAN_CHANGE!: CanChange;

  @IsString()
  CANNOT_REASON?: string;
}

export class ListAppointmentSlotsRequestDto implements IListAppointmentSlotsRequest {
  @IsNotEmpty()
  @IsString()
  customerOrderNo!: string;

  @IsNotEmpty()
  @IsString()
  taskTypeId!: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsDateFormat)
  fromDate!: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsDateFormat)
  toDate!: string;
}

export class ReAppointmentRequestDto implements IReAppointmentRequest {
  @IsNotEmpty()
  @IsString()
  customerOrderNo!: string;

  @IsNotEmpty()
  @IsString()
  teamId!: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsDateFormat)
  date!: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsTimeSlot)
  slot!: string;

  @IsNotEmpty()
  @IsString()
  taskId!: string;
}