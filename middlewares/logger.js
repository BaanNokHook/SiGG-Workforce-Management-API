import bunyan from 'bunyan'

const reqSerializer = (ctx = {}) => ({
  method: ctx.method,
  path: ctx.path,
  url: ctx.url,
  headers: ctx.headers,
  protocol: ctx.protocol,
  ip: ctx.ip,
  query: ctx.query,
})

const resBodySerializer = ({ status, code, message } = {}) => {
  const body = { status, message }
  if (code) body.code = code
  return body
}

const resSerializer = (ctx = {}) => ({
  statusCode: ctx.status,
  responseTime: ctx.responseTime,
  type: ctx.type,
  headers: (ctx.response || {}).headers,
  body: resBodySerializer(ctx.body),
})

/**
 * Return middleware that attachs logger to context and
 * logs HTTP request/response.
 *
 * @param {Object} options={} - Optional configuration.
 * @param {Object} options.logger - Logger instance of bunyan.
 * @return {function} Koa middleware.
 */
const log = (options = {}) => {
  const { logger = null } = options

  if (typeof logger !== 'object' || logger === null) throw new TypeError('Logger required')

  return async (ctx, next) => {
    const startTime = new Date()
    ctx.log = logger.child({ reqId: ctx.reqId })
    ctx.log.addSerializers({
      req: reqSerializer,
      res: resSerializer,
      err: bunyan.stdSerializers.err,
    })

    ctx.log.info({ req: ctx, event: 'request' }, `Request start for id: ${ctx.reqId}`)

    try {
      await next()
    } catch (err) {
      ctx.log.error(
        { err, event: 'error' },
        `Unhandled exception occured on the request: ${ctx.reqId}`,
      )
      throw err
    }

    ctx.responseTime = new Date() - startTime
    ctx.log.info(
      { req: ctx, res: ctx, event: 'response' },
      `Request successfully completed for id: ${ctx.reqId}`,
    )
  }
}

export default log
