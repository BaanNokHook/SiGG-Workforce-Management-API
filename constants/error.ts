// deprecated version
export const BAD_REQUEST = {
  statusCode: 400,
  code: 'BAD_REQUEST',
  message: 'The request has invalid parameters.',
}

export const NOT_FOUND = {
  statusCode: 404,
  code: 'NOT_FOUND',
  message: 'The requested resource could not be found.',
}

export const UNAUTHORIZED = {
  statusCode: 401,
  code: 'UNAUTHORIZED',
  message: 'UNAUTHORIZED',
}

export const INTERNAL_ERROR = {
  statusCode: 500,
  code: 'INTERNAL_ERROR',
  message: 'The server encountered an internal error.',
}

export const UNKNOWN_ERROR = {
  statusCode: 500,
  code: 'UNKNOWN_ERROR',
  message: 'The server encountered an unknown error.',
}

// second version suggestion to avoid
export function MethodNotAllowed(message: string) {
  const instance = new Error(message)
  instance.name = 'MethodNotAllowed'
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this))
  return instance
}

export function NotFound(message: string) {
  const instance = new Error(message)
  instance.name = 'NotFound'
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this))
  return instance
}

interface IMessage {
  title: string
  message: string
}

// improve version design for support i18n
export class CustomError extends Error {
  constructor(message: string, public title?: string, public code?: string, public data?: any) {
    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidateError)
      Error.captureStackTrace(this, CreditWalletFailed)
    }
  }
}

export class ValidateError extends CustomError {}
export class CreditWalletFailed extends CustomError {}
