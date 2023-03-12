import { IRouterContext } from 'koa-router';
import { mapAppError } from './mapAppError';
import { mapAuthError } from './mapAuthError';
import { mapHttpError } from './mapHttpError';
import { mapNotfoundError } from './mapNotfoundError';

export interface IBodyError {
  errors?: string[];
  error: {
    message: string;
  };
}

export interface IErrorResponse {
  status: number;
  body: IBodyError;
}

function mapError(error: Error): IErrorResponse {
  let mappedError;

  if ((mappedError = mapNotfoundError(error))) {
    return mappedError;
  }

  if ((mappedError = mapAppError(error))) {
    return mappedError;
  }

  if ((mappedError = mapHttpError(error))) {
    return mappedError;
  }

  if ((mappedError = mapAuthError(error))) {
    return mappedError;
  }

  return {
    status: 500,
    body: {
      error: {
        message: error.message || error.toString(),
      },
    },
  };
}

export async function errorHandler(ctx: IRouterContext, next: Function) {
  try {
    await next();
  } catch (error) {
    const defaultBody = {
      success: false,
      data: null,
      statusCode: error?.statusCode,
    };
    const { status, body } = mapError(error);
    ctx.status = status;
    ctx.body = Object.assign({}, defaultBody, body);
  }
}
