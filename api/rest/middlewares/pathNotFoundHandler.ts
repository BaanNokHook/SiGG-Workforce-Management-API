import { IRouterContext } from 'koa-router';
import { NotFound } from '../../../errors/errors';

export function pathNotFoundHandler(ctx: IRouterContext) {
  if (ctx.status === 404) {
    throw new NotFound(`${ctx.originalUrl} not found`);
  }
}