import { Body, Controller, Post, UseBefore } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { enableTracing } from '../../../../bootstrapRestApi';
import { TaskTypeDomain } from '../../../../domains/taskType/taskType';
import { GetInstallationTaskTypeRequest } from './TaskTypeController.dto';

@Controller('/v1/task-type')
@UseBefore(enableTracing)
export class TaskTypeController {
  constructor(private taskType: TaskTypeDomain) {}

  @Post('/installation')
  @ResponseSchema(GetInstallationTaskTypeRequest)
  async getInstallationTaskType(@Body() request: GetInstallationTaskTypeRequest) {
    return this.taskType.getInstallationTaskType(request);
  }
}
