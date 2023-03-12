import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseBefore,
} from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { SccdAccecpt } from '../../../../domains/sccd/accept';
import { SccdCancel } from '../../../../domains/sccd/cancel';
import { SccdCreating } from '../../../../domains/sccd/create';
import { SccdErrorHandler } from '../../../../domains/sccd/errorHandler';
import { SccdGetOperationList } from '../../../../domains/sccd/getOperationList';
import { SccdGetTeamsConfig } from '../../../../domains/sccd/getTeamConfig';
import { SccdGetTeams } from '../../../../domains/sccd/getTeams';
import { UpdateRemark } from '../../../../domains/sccd/updateRemark';
import { SccdWorkAssign } from '../../../../domains/sccd/workAssign';
import {
  SccdCancelRequestDto,
  SccdGetOperationListDTO,
  SccdGetTeamConfigDTO,
  SccdGetTeamDTO,
  SccdRequestDto,
  SccdUpdateRemarkDTO,
  WorkAssignmentDTO,
} from './Sccd.dto';

@Controller('/v1/sccd')
@UseBefore(enableTracing)
@UseBefore(SccdErrorHandler)
export class SccdController {
  constructor(
    private sccdCreating: SccdCreating,
    private sccdAccecpt: SccdAccecpt,
    private SccdCancel: SccdCancel,
    private sccdGetTeam: SccdGetTeams,
    private sccdGetTeamConfig: SccdGetTeamsConfig,
    private sccdWorkAssign: SccdWorkAssign,
    private sccdUpdateRemark: UpdateRemark,
    private sccdGetOperationList: SccdGetOperationList,
  ) {}

  @Post('/newWorkOrder')
  public async create(@Body() request: SccdRequestDto) {
    const created = await this.sccdCreating.create(request);
    return created;
  }

  @Post('/cancelWorkOrder')
  public async cancel(@Body() request: SccdCancelRequestDto) {
    const response = await this.SccdCancel.cancel(request);
    return response;
  }

  @Put('/updateAcceptedTask/:taskId')
  public async updateAcceptedTask(@Param('taskId') taskId: string) {
    const taskAccepted = await this.sccdAccecpt.updateAcceptedTask(taskId);
    return taskAccepted;
  }

  @Post('/teams')
  public async getTeams(@Body() request: SccdGetTeamDTO) {
    const { scabCode, requestType } = request;
    return this.sccdGetTeam.getTeamByAreaCode(scabCode, requestType);
  }

  @Post('/teams/config')
  public async getTeamsConfig(@Body() request: SccdGetTeamConfigDTO) {
    return this.sccdGetTeamConfig.getTeamConfig(request);
  }

  @Post('/task-status')
  public async getTaskStatus() {
    return { code: 'E00', message: '', operList: null };
  }

  @Post('/work-assginment')
  public async getWorkAssignment(@Body() request: WorkAssignmentDTO) {
    return this.sccdWorkAssign.getWorkAssignment(request);
  }

  @Post('/remark')
  public async updateRemark(@Body() request: SccdUpdateRemarkDTO) {
    return this.sccdUpdateRemark.updateRemark(request);
  }

  @Get('/remark/requestNo/:requestNo')
  public async getRemark(@Param('requestNo') requestNo: string) {
    return this.sccdUpdateRemark.getRemark(requestNo);
  }

  @Post('/operation-list')
  async getOperationList(@Body() request: SccdGetOperationListDTO) {
    return this.sccdGetOperationList.getOperationList(request);
  }
}
