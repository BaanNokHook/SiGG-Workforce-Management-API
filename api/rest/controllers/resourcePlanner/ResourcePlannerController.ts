import { Body, Controller, Param, Post, UseBefore } from 'routing-controllers';
import { ResourcePlannerService } from '../../../../adapters/grpc/resourcePlanner';
import { enableTracing } from '../../../../bootstrapRestApi';

@Controller('/v1/resource-planner')
@UseBefore(enableTracing)
export class ResourcePlannerController {
  constructor(private resourcePlannerService: ResourcePlannerService) {}

  @Post('/exec/:ruleName')
  async execRule(@Param('ruleName') ruleName: string, @Body() request: Object) {
    return await this.resourcePlannerService.executeRule(ruleName, request);
  }
}
