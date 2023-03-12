import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SUPPORT_VACATION_ACTION {
  VIEW = 'view',
  REMOVE = 'remove',
}

export class SupportStaffVacationDTO {
  @IsNotEmpty()
  @IsString()
  staffCode!: string;

  @IsString()
  @IsNotEmpty()
  installationDate!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsEnum(SUPPORT_VACATION_ACTION)
  action!: string;
}

export class ListStaffCanVisitByOrderIdRequest {
  @IsString()
  orderId!: string;

  @IsString()
  date!: string;
}
export class ListOrderCanVisitByStaffIdRequest {
  @IsString()
  staffId!: string;

  @IsString()
  date!: string;
}

export class ORtoQARequest {
  @IsString()
  @IsNotEmpty()
  ticketNo!: string;

  @IsString()
  @IsNotEmpty()
  appointmentNo!: string;
}

export class CheckAppointmentRequest {
  @IsString()
  @IsNotEmpty()
  staffId!: string

  @IsString()
  @IsNotEmpty()
  timeSlot!: string

  @IsString()
  @IsNotEmpty()
  date!: string
}
