import { IRouterContext } from 'koa-router';

export enum STATUS_CODE {
  CONTINUE = 100,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  UNPROCESSABLE_ENTITY = 422,
  INVALID_REQUEST = 423,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIME_OUT = 504,
}

export interface IResponseData {
  status: string;
  statusCode: number;
  data?: any;
  success?: boolean;
  error?: any;
}

const httpResponse = (ctx: IRouterContext, responseData: IResponseData) => {
  const defaultResponse = Object.assign(
    {
      data: {},
      status: '',
      statusCode: 200,
      success: responseData.success || !responseData.error,
      error: responseData.error || null,
    },
    responseData,
  );

  ctx.status = defaultResponse.statusCode;
  ctx.body = defaultResponse;
};

export const httpOk = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'OK',
    statusCode: STATUS_CODE.OK,
  });
};

export const httpCreated = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'CREATED',
    statusCode: STATUS_CODE.CREATED,
  });
};

export const httpAccepted = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'ACCEPTED',
    statusCode: STATUS_CODE.ACCEPTED,
  });
};

export const httpNoContent = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'NO_CONTENT',
    statusCode: STATUS_CODE.NO_CONTENT,
  });
};

export const httpBadRequest = (ctx: IRouterContext, error: any, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'BAD_REQUEST',
    statusCode: STATUS_CODE.BAD_REQUEST,
    error,
  });
};

export const httpForbidden = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'FORBIDDEN',
    statusCode: STATUS_CODE.FORBIDDEN,
  });
};

export const httpNotFound = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'NOT_FOUND',
    statusCode: STATUS_CODE.NOT_FOUND,
  });
};

export const httpRequestTimeout = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'REQUEST_TIMEOUT',
    statusCode: STATUS_CODE.REQUEST_TIMEOUT,
  });
};

export const httpUnprocessableEntity = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'UNPROCESSABLE_ENTITY',
    statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
  });
};

export const httpUnauthorized = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'UNAUTHORIZED',
    statusCode: STATUS_CODE.UNAUTHORIZED,
  });
};

export const httpInternalServerError = (
  ctx: IRouterContext,
  error: any,
  data?: any,
) => {
  httpResponse(ctx, {
    data,
    status: 'INTERNAL_SERVER_ERROR',
    statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
    error,
  });
};

export const httpNotImplemented = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'NOT_IMPLEMENTED',
    statusCode: STATUS_CODE.NOT_IMPLEMENTED,
  });
};

export const httpBadGateway = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'BAD_GATEWAY',
    statusCode: STATUS_CODE.BAD_GATEWAY,
  });
};

export const httpServiceUnavailable = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'SERVICE_UNAVAILABLE',
    statusCode: STATUS_CODE.SERVICE_UNAVAILABLE,
  });
};

export const httpGatewayTimeOut = (ctx: IRouterContext, data?: any) => {
  httpResponse(ctx, {
    data,
    status: 'GATEWAY_TIME_OUT',
    statusCode: STATUS_CODE.GATEWAY_TIME_OUT,
  });
};
