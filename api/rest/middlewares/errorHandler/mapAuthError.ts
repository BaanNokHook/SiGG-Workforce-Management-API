import { IErrorResponse } from '.';
import { AuthenticationError } from '../../../../libraries/authentication/errors';

export function mapAuthError(error: Error): IErrorResponse | undefined {
  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: {
        error: {
          message: error.message,
        },
      },
    };
  }

  return
}