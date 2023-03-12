import { DefaultContext, Next } from 'koa';
import { IRouterContext } from 'koa-router';
import { ILogger } from '../../../libraries/logger/logger.interface';

export interface IOptions {
  logger: ILogger
}

const reqSerializer = (ctx: DefaultContext) => ({
  reqId: ctx.reqId,
  method: ctx.method,
  path: ctx.path,
  url: ctx.url,
  headers: ctx.headers,
  protocol: ctx.protocol,
  ip: ctx.ip,
  query: ctx.query
})

const resBodySerializer = ({ status, message }: IRouterContext) => {
  return { status, message }
}

const resSerializer = (ctx: DefaultContext, responseTime: number) => ({
  statusCode: ctx.status,
  type: ctx.type,
  headers: (ctx.response || {}).headers,
  body: resBodySerializer(ctx.body || {}),
  responseTime
})

export function loggingMiddleware({ logger }: IOptions) {
  return async (ctx: DefaultContext, next: Next) => {
    const startTime = Date.now()

    const req = reqSerializer(ctx)
    logger.info({ req, event: 'request' })

    try {
      await next();

      const responseTime = Date.now() - startTime
      const res = resSerializer(ctx, responseTime)
      logger.info({ req, res, event: 'response' })
    } catch (err) {
      logger.error({ req, err, event: 'error' })
      throw err
    }
  }
}
