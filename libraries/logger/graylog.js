var winston = require('winston')
var util = require('util')
var stackTrace = require('stack-trace')
require('winston-koa-logger')
require('winston-graylog2')
var gelfPro = require('gelf-pro')
var config = require('../../config')
var _ = require('lodash')

const { projectName, baseURI, env } = config.default.system

gelfPro.setConfig({
    fields: {
        SERVICE: projectName,
        APP_ENV: env,
        BASE_URI: baseURI
    }, // optional; default fields for all messages
    filter: [], // optional; filters to discard a message
    transform: [], // optional; transformers for a message
    broadcast: [], // optional; listeners of a message
    levels: {}, // optional; default: see the levels section below
    aliases: {}, // optional; default: see the aliases section below
    adapterName: 'tcp', // optional; currently supported "udp", "tcp" and "tcp-tls"; default: udp
    adapterOptions: { // this object is passed to the adapter.connect() method
        // common
        host: 'logging.kube.sendit.asia', // optional; default: 127.0.0.1
        port: 12201, // optional; default: 12201
        // ... and so on

        // tcp adapter example
        family: 4, // tcp only; optional; version of IP stack; default: 4
        timeout: 1000, // tcp only; optional; default: 10000 (10 sec)

        // udp adapter example
        protocol: 'udp4' // udp only; optional; udp adapter: udp4, udp6; default: udp4

        // tcp-tls adapter example
        //   key: fs.readFileSync('client-key.pem'), // tcp-tls only; optional; only if using the client certificate authentication
        //   cert: fs.readFileSync('client-cert.pem'), // tcp-tls only; optional; only if using the client certificate authentication
        //   ca: [fs.readFileSync('server-cert.pem')] // tcp-tls only; optional; only for the self-signed certificate
    }
})

var levelsMapping = {
    emerg: 'emergency',
    alert: 'alert',
    crit: 'critical',
    error: 'error',
    warning: 'warning',
    warn: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug'
}

var getMessageLevel = function (winstonLevel) {
    return levelsMapping[winstonLevel] || levelsMapping.info
}

var processMeta = function (meta) {
    var callers
    try {
        callers = stackTrace.get().slice(2)
            .filter(c => c.getFileName())
            .filter(c => c.getFileName().indexOf('/app/') > -1)
            .map(caller => `${(caller.getFunctionName() || caller.getMethodName())}@${caller.getFileName()}:${caller.getLineNumber()}`)
            .join('\n')
    } catch (e) {
        callers = "Can't extract caller" + e
    }
    return _.assign({}, meta, {
        callers: callers
    })
}

var Graylog2 = winston.transports.Graylog2 = function (options) {
    winston.Transport.call(this, options)
}

util.inherits(Graylog2, winston.Transport)

Graylog2.prototype.log = function (level, msg, meta, callback) {
    gelfPro[getMessageLevel(level)](msg, processMeta(meta))
    callback(null, true)
}

var logger = new (winston.Logger)({})
if (_.includes(['development', 'dev', '', undefined], env)) {
    logger.add(winston.transports.Console, {
        json: true
    })
}
if (_.includes(['staging', 'production'], env)) {
    logger.add(winston.transports.Graylog2, {})
}
var middleware = async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    if (ctx.originalUrl.indexOf('/system/health') > -1 && ctx.status === 200) {
        return
    }

    let logLevel
    if (ctx.status >= 500) {
        logLevel = 'error'
    }
    if (ctx.status >= 400) {
        logLevel = 'warn'
    }
    if (ctx.status >= 100) {
        logLevel = 'info'
    }

    let msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`
    logger.log(logLevel, msg, {
        status: ctx.status,
        url: ctx.originalUrl,
        body: (ctx.status > 299 || ctx.status < 200) ? JSON.stringify(ctx.body, null, 2) : undefined,
        stack: (ctx.stack) ? ctx.stack : undefined,
        responseTime: ms
    })
}

module.exports = {
    emerg: logger.emerg,
    alert: logger.alert,
    crit: logger.crit,
    error: logger.error,
    warning: logger.warning,
    warn: logger.warn,
    notice: logger.notice,
    info: logger.info,
    debug: logger.debug,
    middleware: middleware
}
