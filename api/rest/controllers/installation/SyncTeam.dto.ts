import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IBuildTeamRequest } from '../../../../domains/installation/interface';

export class CreateTeamRequestDto implements IBuildTeamRequest {
  @IsNotEmpty()
  @IsString()
  teamCode!: string;

  @IsNotEmpty()
  @IsString()
  teamName!: string;

  @IsOptional()
  teamParent?: string;
}
