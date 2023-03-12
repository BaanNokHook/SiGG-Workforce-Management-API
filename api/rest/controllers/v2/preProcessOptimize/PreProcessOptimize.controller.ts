import { IRouterContext } from 'koa-router';
import { Body, Controller, Ctx, Post, UseBefore } from 'routing-controllers';
import { enableTracing } from '../../../../../bootstrapRestApi';
import { PreProcessTaskOptimizeDomain } from '../../../../../domains/preProcessOptimize/preProcessTaskOptimize.domain';
import { getCurrentDateString } from '../../../../../utils/date';
import { combinePathForResponse } from '../../preProcessOptimize/utils';
import { PreProcessOptimizeDTO } from './PreProcessOptimize.dto';

@Controller('/v2/pre-process-optimize')
@UseBefore(enableTracing)
export class PreProcessOptimize {
  constructor(
    private preProcessTaskOptimizeDomain: PreProcessTaskOptimizeDomain,
  ) {}

  @Post()
  public async make(
    @Ctx() ctx: IRouterContext,
    @Body() request: PreProcessOptimizeDTO,
  ) {
    // Custom timeout route 8 minute (koa default is 2 minute)
    ctx.socket.setTimeout(8 * 60 * 1000);

    const requestDate =
      request.date !== ''
        ? request.date
        : getCurrentDateString(request.dateOffset);

    const created = await this.preProcessTaskOptimizeDomain.make({
      zoneName: request.zoneName,
      areaCode: request.areaCode,
      date: requestDate,
      outputPath: request.outputPath,
      debugMode: request.debugMode,
    });

    ctx.status = 201;

    return {
      date: requestDate,
      outputPath: combinePathForResponse(
        requestDate,
        request.outputPath,
        request.zoneName,
      ),
      mode: created?.result?.mode,
      locations: created?.result?.locations?.ids?.length ?? 0,
      vehicles: created?.result?.vehicles?.ids?.length ?? 0,
      metaDataDropNode: created?.result?.metaData?.dropNodes?.length ?? 0,
    };
  }
}
