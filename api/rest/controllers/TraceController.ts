import { Controller, Get, QueryParam, UseBefore } from 'routing-controllers';
import { Inject } from 'typedi';
import { EchoService } from '../../../adapters/echo/echo.service';
import { enableTracing } from '../../../bootstrapRestApi';
import { ILogger } from '../../../libraries/logger/logger.interface';
import { IDemoRepository } from '../../../repositories/demo/demo.repository';

@Controller('/trace')
@UseBefore(enableTracing)
export class TraceController {
  constructor(
    private echoService: EchoService,
    @Inject('IDemoRepository') private repo: IDemoRepository,
    @Inject('logger') private logger: ILogger,
  ) {}

  @Get()
  async trace(@QueryParam('error') error?: string) {
    const demo = await this.repo.findByName('Test');

    this.logger.info({ demo });

    const echo = await this.echoService
      .doEcho(error)
      .catch((err) => ({ error: err.toString() }));

    return { demo, echo };
  }
}
