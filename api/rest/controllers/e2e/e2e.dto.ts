import { IsNotEmpty, IsString } from 'class-validator';

export class E2ERequestDTO {
  @IsString()
  @IsNotEmpty()
  circuit!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;
}
