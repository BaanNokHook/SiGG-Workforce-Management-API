/**
 * HTTP Status codes
 */
const statusCodes = {
  CONTINUE: 100,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  UNPROCESSABLE_ENTITY: 422,
  INVALID_REQUEST: 423,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIME_OUT: 504,
}

const responseHandler = () => async (ctx, next) => {
  ctx.res.statusCodes = statusCodes
  ctx.statusCodes = ctx.res.statusCodes

  ctx.res.success = ({ statusCode, data = null }) => {
    if (!!statusCode && statusCode < 400) ctx.status = statusCode
    else if (!(ctx.status < 400)) ctx.status = statusCodes.OK

    const status = 'OK'
    const code = statusCodes.OK
    ctx.body = { status, statusCode: code, data }
  }

  ctx.res.fail = ({ statusCode, messageCode, message, error = {}, status }) => {
    if (!!statusCode && (statusCode >= 400 && statusCode < 500)) ctx.status = statusCode
    else if (!(ctx.status >= 400 && ctx.status < 500)) ctx.status = statusCodes.BAD_REQUEST

    ctx.body = { messageCode, message, error, status, statusCode }
  }

  ctx.res.error = ({ statusCode, messageCode, error = null, message = null }) => {
    const status = 'error'

    if (!!statusCode && (statusCode >= 500 && statusCode < 600)) ctx.status = statusCode
    else if (!(ctx.status >= 500 && ctx.status < 600))
      ctx.status = statusCodes.INTERNAL_SERVER_ERROR

    ctx.body = { message, error, status, statusCode, messageCode }
  }

  ctx.res.ok = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.OK,
    })
  }

  ctx.res.created = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.CREATED,
    })
  }

  ctx.res.accepted = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.ACCEPTED,
    })
  }

  ctx.res.noContent = (params = {}) => {
    ctx.res.success({
      ...params,
      statusCode: statusCodes.NO_CONTENT,
    })
  }

  ctx.res.badRequest = (params = {}) => {
    ctx.res.fail({
      ...params,
      status: 'BAD_REQUEST',
      statusCode: statusCodes.BAD_REQUEST,
    })
  }

  ctx.res.forbidden = (params = {}) => {
    ctx.res.fail({
      ...params,
      statusCode: statusCodes.FORBIDDEN,
    })
  }

  ctx.res.notFound = (params = {}) => {
    ctx.res.fail({
      ...params,
      status: 'NOT_FOUND',
      statusCode: statusCodes.NOT_FOUND,
    })
  }

  ctx.res.requestTimeout = (params = {}) => {
    ctx.res.fail({
      ...params,
      statusCode: statusCodes.REQUEST_TIMEOUT,
    })
  }

  ctx.res.unprocessableEntity = (params = {}) => {
    ctx.res.fail({
      ...params,
      statusCode: statusCodes.UNPROCESSABLE_ENTITY,
    })
  }

  ctx.res.unauthorized = (params = {}, error = '') => {
    ctx.res.fail({
      ...params,
      error,
      statusCode: statusCodes.UNAUTHORIZED,
    })
  }

  ctx.res.internalServerError = (params = {}, error = '') => {
    ctx.res.error({
      ...params,
      error,
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      message: params.message,
    })
  }

  ctx.res.notImplemented = (params = {}) => {
    ctx.res.error({
      ...params,
      statusCode: statusCodes.NOT_IMPLEMENTED,
    })
  }

  ctx.res.badGateway = (params = {}) => {
    ctx.res.error({
      ...params,
      statusCode: statusCodes.BAD_GATEWAY,
    })
  }

  ctx.res.serviceUnavailable = (params = {}) => {
    ctx.res.error({
      ...params,
      statusCode: statusCodes.SERVICE_UNAVAILABLE,
    })
  }

  ctx.res.gatewayTimeOut = (params = {}) => {
    ctx.res.error({
      ...params,
      statusCode: statusCodes.GATEWAY_TIME_OUT,
    })
  }
  await next()
}

export default responseHandler
