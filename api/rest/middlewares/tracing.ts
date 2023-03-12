import { Context, Next } from "koa";
import { Span } from 'opentracing';

export interface ICtxTracing {
  startSpanFromCtx(ctx: Context): Span
  finishSpanFromCtx(span: Span, ctx: Context, err?: any): void
}

export function globalTracingMiddleware(traceUtil: ICtxTracing) {
  return async (ctx: Context, next: Next) => {

    const span = traceUtil.startSpanFromCtx(ctx)

    try {
      await next()

      traceUtil.finishSpanFromCtx(span, ctx)
    } catch (err) {
      traceUtil.finishSpanFromCtx(span, ctx, err)

      throw err
    }
  }
}