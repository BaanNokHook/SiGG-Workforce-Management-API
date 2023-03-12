import { BadRequestError, HttpError } from 'routing-controllers';
import { IErrorResponse } from '.';
import { formatClassValidatorErrors } from './formatter';

export function mapHttpError(error: Error): IErrorResponse | undefined {
  if (!(error instanceof HttpError)) return;

  if (error instanceof BadRequestError && (error as any).errors) {
    return {
      status: error.httpCode,
      body: {
        errors: formatClassValidatorErrors((error as any).errors),
        error: {
          message: error.message,
        },
      },
    };
  }

  return {
    status: error.httpCode,
    body: {
      error: {
        message: error.message,
      },
    },
  };
}
