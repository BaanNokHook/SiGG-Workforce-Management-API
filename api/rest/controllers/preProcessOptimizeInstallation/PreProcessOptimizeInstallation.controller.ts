import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IRouterContext } from 'koa-router';
import { Body, Controller, Ctx, Post, UseBefore } from 'routing-controllers';
import { Inject } from 'typedi';
import { enableTracing } from '../../../../bootstrapRestApi';
import { PreProcessOptimizeInstallationDomain } from '../../../../domains/preprocessOptimizeInstallation/preProcessOptimizeInstallation.domain';
import { ILogger } from '../../../../libraries/logger/logger.interface';
import {
  uploadJsonToS3,
  uploadJsonToS3WithFilePath,
} from '../../../../libraries/s3';
import { consoleLogger } from '../../../../logger';
import { getCurrentDateString } from '../../../../utils/date';
import { combinePathForResponse } from '../preProcessOptimize/utils';

export class PreProcessOptimizeInstallationRequest {
  @IsString()
  zoneName!: string;

  @IsArray()
  teamCodes!: string[];

  @IsString()
  date!: string;

  @IsString()
  @IsOptional()
  outputPath?: string;

  @IsBoolean()
  @IsOptional()
  debugMode?: boolean = false;

  @IsNumber()
  @IsOptional()
  dateOffset?: number = 0;
}

@Controller('/v1/pre-process-optimize-installation')
@UseBefore(enableTracing)
export class PreProcessOptimizeInstallation {
  constructor(
    @Inject('config.aws') private awsConfig: any,
    @Inject('logger') private logger: ILogger = consoleLogger,
    private preProcessOptimizeInstallationDomain: PreProcessOptimizeInstallationDomain,
  ) {}

  private async uploadOptimizeInputToS3(
    zoneName: string,
    generateInput: any,
    date?: string,
    outputPath?: string,
  ) {
    try {
      if (outputPath && outputPath !== '') {
        const uploaded = await uploadJsonToS3WithFilePath(
          this.awsConfig.AWS_BUCKET_NAME,
          outputPath,
          JSON.stringify(generateInput),
        );
        this.logger.debug(
          { event: 'uploadDataToS3', outputPath, date, uploaded },
          'End uploading pre-process-optimize',
        );
      } else {
        const uploaded = await uploadJsonToS3(
          this.awsConfig.AWS_BUCKET_NAME,
          zoneName,
          `input_${date}.json`,
          JSON.stringify(generateInput),
        );
        this.logger.debug(
          { event: 'uploadDataToS3', zoneName, date, uploaded },
          'End uploading pre-process-optimize',
        );
      }
    } catch (error) {
      this.logger.error(`uploadData error: ${error}`);
    }
  }

  @Post()
  public async make(
    @Ctx() ctx: IRouterContext,
    @Body() request: PreProcessOptimizeInstallationRequest,
  ) {
    const {
      teamCodes,
      date,
      zoneName,
      outputPath,
      debugMode,
      dateOffset,
    } = request;
    const processDate = date !== '' ? date : getCurrentDateString(dateOffset);

    const optimizeInstallationInput = await this.preProcessOptimizeInstallationDomain.make(
      zoneName,
      teamCodes,
      processDate,
    );

    if (!debugMode) {
      this.uploadOptimizeInputToS3(
        zoneName,
        optimizeInstallationInput,
        processDate,
        outputPath,
      );
    }

    ctx.status = 201;
    return {
      date: processDate,
      outputPath: combinePathForResponse(processDate, outputPath, zoneName),
      mode: optimizeInstallationInput?.mode,
      locations: optimizeInstallationInput.locations?.ids?.length ?? 0,
      vehicles: optimizeInstallationInput?.vehicles?.ids.length ?? 0,
    };
  }
}
