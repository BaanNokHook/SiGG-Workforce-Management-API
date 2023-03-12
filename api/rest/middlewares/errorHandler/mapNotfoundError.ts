import { IErrorResponse } from '.';
import { NotFound } from '../../../../errors/errors';

export function mapNotfoundError(error: Error): IErrorResponse | undefined {
  if (error instanceof NotFound) {
    return {
      status: 404,
      body: {
        error: {
          message: error.message,
        },
      },
    };
  }

  return
}