import { IErrorResponse } from '.';
import {
  AlreadyExists,
  RequestError,
  ValidateFieldError,
} from '../../../../errors/errors';
import { ResponseError } from '../../../../libraries/client/restClient';

export function mapAppError(error: Error): IErrorResponse | undefined {
  if (error instanceof ResponseError) {
    return {
      status: error.status,
      body: error.data,
    };
  }

  if (
    error instanceof AlreadyExists ||
    error instanceof ValidateFieldError ||
    error instanceof RequestError
  ) {
    return {
      status: 400,
      body: {
        error: {
          message: error.message,
        },
      },
    };
  }

  return;
}
