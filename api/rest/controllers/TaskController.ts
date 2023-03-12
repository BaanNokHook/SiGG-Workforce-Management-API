import { IsNotEmpty } from 'class-validator';
import { Body, Controller, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { CfmDomain } from '../../../domains/cfm/cfm.domain';
import { TaskCreator } from '../../../domains/cfm/interface';
import { SccdFinishingOrder } from '../../../domains/sccd/finishOrder';

class CloseTicketCfmRequestDto {
  @IsNotEmpty()
  todo!: object;

  @IsNotEmpty()
  results!: object;
}

@Controller('/v1/tasks')
export class TaskController {
  constructor(
    private cfmDomain: CfmDomain,
    private sccdFinishOrder: SccdFinishingOrder,
  ) {}

  @Post('/close-ticket-cfm')
  @ResponseSchema(CloseTicketCfmRequestDto)
  async closeTicketCfm(@Body() body: CloseTicketCfmRequestDto) {
    let data;
    const todo = body.todo as any;
    const result = body.results as any;
    const createUser: TaskCreator =
      todo?.taskId?.information?.metaInformation?.baseInformation?.createUser;
    switch (createUser) {
      case TaskCreator.SCCD: {
        data = await this.sccdFinishOrder.updateFinishOrder(todo, result);
        break;
      }
      case TaskCreator.TRUE_CFM:
      default: {
        data = await this.cfmDomain.closeTicket(body);
      }
    }

    return {
      statusCode: 200,
      status: 'success',
      data,
    };
  }
}
