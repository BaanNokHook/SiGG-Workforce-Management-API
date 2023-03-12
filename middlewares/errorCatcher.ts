import { Context, Next } from 'koa'
import {
  NOT_FOUND,
  ValidateError,
  MethodNotAllowed,
  NotFound,
  CreditWalletFailed,
  CustomError,
} from '../constants/error'
import DBError from '../error/mongoose'
import { Translator } from '../libraries/i18n/translator'

type MappingValue = 'badRequest' | 'unauthorized' | 'forbidden' | 'notFound'
const CODE_MAPPING: { [key: number]: MappingValue } = {
  400: 'badRequest',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'notFound',
}

// don't sure why we send response like this
// check and remove this function later
function mapCtxBody(error: CustomError) {
  let response = {
    status: 500,
    success: false,
    data: null,
    error: {
      title: error.title,
      message: error.message,
      code: error.code,
    },
  }

  if (error instanceof ValidateError) {
    response.status = 400
  }

  if (error instanceof NotFound) {
    response.status = 404
  }

  if (error instanceof MethodNotAllowed) {
    response.status = 405
  }

  // same as validation error
  if (error instanceof CreditWalletFailed) {
    response.status = 400
  }

  return response
}

function translateError(translator: Translator, language: string, error: CustomError) {
  let _error = {
    title: error.title || '',
    message: error.message,
    code: error.code || '',
  }

  if (error.code) {
    _error.title = translator.translate(language, `${error.code}.title`, error?.data)
    _error.message = translator.translate(language, `${error.code}.message`, error?.data)
  }

  return _error
}

function getLanguage(language: string | string[] = 'th') {
  if (Array.isArray(language)) {
    const [_language] = language
    return _language.toLowerCase()
  }

  return language.toLowerCase()
}

export default function errorCatcher(translator: Translator) {
  return async (ctx: Context, next: Next) => {
    try {
      await next()
      if (!ctx.body && (!ctx.status || ctx.status === 404)) ctx.res.notFound(NOT_FOUND)
    } catch (err) {
      let body = mapCtxBody(err)
      if (body.status !== 500) {
        const language = getLanguage(ctx.headers?.language)
        body.error = translateError(translator, language, err)

        ctx.status = body.status
        ctx.body = body
      } else {
        let error = err

        if (err.kind === 'ObjectId') {
          error = DBError.MONGOOSE_OBJECT_ID_INVALID(err)
        }

        const respFunc = ctx.res[CODE_MAPPING[error.statusCode] || 'internalServerError']
        respFunc.call(null, error)

        ctx.app.emit('error', error, ctx)
      }
    }
  }
}
