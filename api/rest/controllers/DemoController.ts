import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Body, Controller, Get, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { DemoDomain } from '../../../domains/demo/demo.domain';
import { IDemo, IDemoRequest } from '../../../domains/demo/interface';

class DemoRequestDto implements IDemoRequest {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsString()
  authorEmail!: string;

  @IsDate({ message: 'presentDate need to be a date' })
  @Type(() => Date)
  presentDate!: Date;
}

class DemoDto implements IDemo {
  @IsString()
  _id!: string;

  @IsString()
  name!: string;

  @IsString()
  authorEmail!: string;

  @IsString()
  author?: string;

  @IsDate()
  presentDate!: Date;
}

@Controller('/v1/demos')
export class DemoController {
  constructor(private demoDomain: DemoDomain) {}

  @Post()
  @ResponseSchema(DemoDto)
  createDemo(@Body() request: DemoRequestDto) {
    return this.demoDomain.createDemo(request);
  }

  @Get('/all')
  allDemo() {
    return this.demoDomain.findAll();
  }
}
