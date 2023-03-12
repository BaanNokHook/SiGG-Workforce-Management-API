import uuid = require('uuid')
import { DefaultContext, Middleware, Next } from 'koa'

declare module 'koa-router' {
  interface IRouterContext {
    reqId?: string;
  }
}

export interface IOptions {
  header?: string

}

export const requestIdMiddleware = (options: IOptions = {}): Middleware => {
  const { header = 'X-Request-Id' } = options

  return (ctx: DefaultContext, next: Next) => {
    const reqId = ctx.request.get(header) || uuid.v4()
    ctx.reqId = reqId
    ctx.set(header, reqId)
    return next()
  }
}
