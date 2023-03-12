import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Body, Controller, Get, Param, Post } from 'routing-controllers';
import { DeviceDomain } from '../../../domains/device/device.domain';
import { DeviceType } from '../../../domains/device/interface';

export class InstallDeviceRequestDto {
  @IsNotEmpty()
  @IsString()
  taskId!: string;

  @IsNotEmpty()
  @IsString()
  serialNumber!: string;

  @IsEnum(DeviceType)
  deviceType!: DeviceType;
}

@Controller('/v1/devices')
export class DeviceController {
  constructor(private deviceDomain: DeviceDomain) {}

  @Get('/install/accessno/:accessno')
  async getDevices(@Param('accessno') accessno: string) {
    const data = await this.deviceDomain.getDevices(accessno);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }

  @Post('/install')
  async install(@Body() request: InstallDeviceRequestDto) {
    const data = await this.deviceDomain.install(request);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
