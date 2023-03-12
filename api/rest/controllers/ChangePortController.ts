import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Body, Controller, Get, Param, Post } from 'routing-controllers';
import { ChangePortDomain } from '../../../domains/changePort/changePort.domain';
import { OldPortState } from '../../../domains/changePort/interface';

class ChangePortRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @IsString()
  @IsNotEmpty()
  todoId!: string;

  @IsString()
  @IsNotEmpty()
  neNo!: string;

  @IsString()
  @IsNotEmpty()
  portNo!: string;

  @IsString()
  @IsNotEmpty()
  reasonCode!: string;

  @IsString()
  @IsNotEmpty()
  reasonName!: string;

  @IsEnum(OldPortState)
  @IsNotEmpty()
  oldPortState!: OldPortState;
}

@Controller('/v1/change-port')
export class ChangePortController {
  constructor(private changePortDomain: ChangePortDomain) {}

  // Check order status
  @Get('/check/:accessNo')
  changeOrderStatus(@Param('accessNo') accessNo: string) {
    return this.changePortDomain.checkOrderStatus(accessNo);
  }

  // Get splitter ports
  @Get('/splitters/:splitterName/ports')
  getSplitterPorts(@Param('splitterName') splitterName: string) {
    return this.changePortDomain.getSplitterPorts(splitterName);
  }

  // Submit change port
  @Post('/submit')
  async changePort(@Body() changePortRequestDto: ChangePortRequestDto) {
    const data = await this.changePortDomain.submitChangePort(
      changePortRequestDto,
    );
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
