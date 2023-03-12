import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Body, Controller, Get, Param, Post } from 'routing-controllers';
import { CpeDomain } from '../../../domains/cpe/cpe.domain';

class SwapRequestDto {
  @IsNotEmpty()
  taskId!: string;

  @IsNotEmpty()
  newSerialNumber!: string;

  @IsNotEmpty()
  oldSerialNumber!: string;

  @IsNotEmpty()
  deviceType!: string;

  @IsString()
  @IsOptional()
  loid!: string;

  @IsNotEmpty()
  dsn!: string;
}

@Controller('/v1/devices/cpe')
export class CpeController {
  constructor(private cpeDomain: CpeDomain) {}

  // findAll device
  @Get('/accessno/:accessno')
  async getDevices(@Param('accessno') accessno: string) {
    const data = await this.cpeDomain.getDevices(accessno);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  // findById
  @Get('/accessno/:accessno/serial-number/:serialNumber')
  async getDeviceBySerialNumber(
    @Param('accessno') accessno: string,
    @Param('serialNumber') serialNumber: string,
  ) {
    const data = await this.cpeDomain.getDeviceBySerialNumber(
      accessno,
      serialNumber,
    );
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  @Post('/verify')
  async verifyAndCheckActivated(@Body() request: SwapRequestDto) {
    const data = await this.cpeDomain.verifyAndCheckActivated(request);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  @Post('/swap')
  async swap(@Body() request: SwapRequestDto) {
    const data = await this.cpeDomain.swap(request);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
