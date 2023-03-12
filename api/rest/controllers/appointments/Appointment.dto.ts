import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IAppointmentRequest } from '../../../../domains/appointment/interface';

export class AppointmentRequestDto implements IAppointmentRequest {
  @IsString()
  @IsNotEmpty()
  appointmentDate!: string;

  @IsString()
  @IsNotEmpty()
  appointmentTime!: string;

  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsOptional()
  areaCode!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  companyId!: string;
}
