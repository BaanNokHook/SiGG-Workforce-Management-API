import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ICreateStaffVacationRequest,
  IStaffDefaultLocation,
  IUpdateStaffInfoRequest,
  STAFF_ROLE,
  STAFF_STATUS,
  VACATION_STATUS,
} from '../../../../domains/installation/interface';

export class StaffDefaultLocationDto implements IStaffDefaultLocation {
  @IsOptional()
  @IsLatitude()
  lat!: number;

  @IsOptional()
  @IsLongitude()
  long!: number;
}
export class UpdateStaffRequestDto implements IUpdateStaffInfoRequest {
  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  staffCode!: string;

  @IsString()
  @IsNotEmpty()
  staffName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsEnum(STAFF_ROLE)
  role!: STAFF_ROLE;

  @IsEnum(STAFF_STATUS)
  status!: STAFF_STATUS;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StaffDefaultLocationDto)
  defaultLocation!: StaffDefaultLocationDto;
}

export class CreateStaffVacationRequestDto
  implements ICreateStaffVacationRequest {
  @IsNotEmpty()
  @IsDateString()
  vacationStartTime!: string;

  @IsNotEmpty()
  @IsDateString()
  vacationEndTime!: string;

  @IsString()
  @IsEnum(VACATION_STATUS, { message: 'status must be active or inactive' })
  status!: VACATION_STATUS;
}
