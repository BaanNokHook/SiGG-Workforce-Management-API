import { Body, Controller, Post, UseBefore } from 'routing-controllers';
import { enableTracing } from '../../../../bootstrapRestApi';
import { E2EDomain } from '../../../../domains/e2e/e2e.domain';
import { E2ERequestDTO } from './e2e.dto';

@Controller('/v1/e2e')
@UseBefore(enableTracing)
export class E2EController {
  constructor(private e2eDomain: E2EDomain) {}

  @Post()
  public async testE2E(@Body() req: E2ERequestDTO) {
    return this.e2eDomain.testE2E(req);
  }
}
