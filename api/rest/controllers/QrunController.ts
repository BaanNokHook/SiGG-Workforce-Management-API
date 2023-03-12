import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Body, Controller, Post, QueryParam } from 'routing-controllers';
import { CallVerifyDomain } from '../../../domains/callVerify/callVerify.domain';
import { ChangePortDomain } from '../../../domains/changePort/changePort.domain';
import { UpdateCallLogDomain } from '../../../domains/installation/updateCallLog.domain';
import { UpdateTechnicianInTaskDomain } from '../../../domains/installation/updateTechnicianInTask.domain';

enum CallbackType {
  CHANGE_SPLITTER = 'CHANGE_SPLITTER',
  CHANGE_CPE = 'CHANGE_CPE',
}

class swapNotificationRequestDto {
  @IsEnum(CallbackType)
  @IsNotEmpty()
  type!: CallbackType;

  @IsString()
  @IsNotEmpty()
  portNo!: string;

  @IsString()
  @IsNotEmpty()
  taskOrderNo!: string;

  @IsString()
  @IsNotEmpty()
  resNo!: string;

  @IsString()
  Remark!: string;
}

class updateTechnicianInTaskRequestDto {
  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsBoolean()
  @IsOptional()
  forceUpdate?: boolean;
}

class updateCallLogRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @IsString()
  @IsOptional()
  contactName!: string;

  @IsString()
  @IsOptional()
  contactNumber!: string;

  @IsString()
  @IsNotEmpty()
  callTime!: string;
}

class validateCallVerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;
}

@Controller('/qrun')
export class QrunController {
  constructor(
    private changePortDomain: ChangePortDomain,
    private updateTechnicianInTaskService: UpdateTechnicianInTaskDomain,
    private updateCallLogDomain: UpdateCallLogDomain,
    private callVerifyDomain: CallVerifyDomain,
  ) {}

  @Post('/update-technician-in-task')
  async updateTechnicianInTask(
    @Body() request: updateTechnicianInTaskRequestDto,
    @QueryParam('ignoreError') ignoreError: string,
  ) {
    const { staffId, orderId, forceUpdate = false } = request;

    try {
      const resp = await this.updateTechnicianInTaskService.updateTechnicianInTask(
        staffId,
        orderId,
        forceUpdate,
      );
      return {
        success: true,
        data: {
          message: resp,
        },
      };
    } catch (error) {
      if (ignoreError) {
        return {
          success: true,
          data: {
            message: 'Error but ignore.',
            error,
          },
        };
      }
      throw error;
    }
  }

  @Post('/update-call-log')
  async updateCallLog(@Body() body: updateCallLogRequestDto) {
    const resp = await this.updateCallLogDomain.updateCallLog(body);
    return resp;
  }

  @Post('/swap-notification')
  swapNotification(
    @Body() swapNotificationRequestDto: swapNotificationRequestDto,
  ) {
    const { type, ...input } = swapNotificationRequestDto;

    switch (type) {
      case CallbackType.CHANGE_SPLITTER:
        return this.changePortDomain.callbackChangePort(input);
      case CallbackType.CHANGE_CPE:
      default:
        return {
          isSuccess: false,
          orderId: null,
          taskOrderNo: null,
          errorInfo: 'Unknown swap notification type',
        };
    }
  }

  @Post('/validate-call-verify')
  async validateCallVerify(@Body() body: validateCallVerifyRequestDto) {
    const data = await this.callVerifyDomain.validateCallVerify(body);
    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
