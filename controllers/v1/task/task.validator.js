import ThrowError from '../../../error/basic'

export function isISOStringDateValid(date) {
  return typeof date === 'string' && new Date(date) instanceof Date && !isNaN(new Date(date))
}

export function isArrayOfString(list) {
  return Array.isArray(list) && list.every((ele) => typeof ele === 'string')
}

export async function findTasksValidator(ctx, next) {
  const { body } = ctx.request
  const { startTime, endTime } = body

  if (body.startTime && body.endTime) {
    if (!isISOStringDateValid(startTime)) {
      throw ThrowError.FIELD_IS_INVALID('startTime must be a ISO date string')
    }

    if (!isISOStringDateValid(endTime)) {
      throw ThrowError.FIELD_IS_INVALID('endTime must be a ISO date string')
    }

    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      throw ThrowError.FIELD_IS_INVALID('startTime must be less than endTime')
    }
  }

  await next()
}

export async function findMonitorListTasksValidator(ctx, next) {
  const { body } = ctx.request
  const { staffs, areaCodes, startTime, endTime } = body

  if (!isISOStringDateValid(startTime)) {
    throw ThrowError.FIELD_IS_INVALID('startTime must be a ISO date string')
  }

  if (!isISOStringDateValid(endTime)) {
    throw ThrowError.FIELD_IS_INVALID('endTime must be a ISO date string')
  }

  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    throw ThrowError.FIELD_IS_INVALID('startTime must be less than endTime')
  }

  if (!isArrayOfString(staffs)) {
    throw ThrowError.FIELD_IS_INVALID('staffs must be a list of string')
  }

  if (!isArrayOfString(areaCodes)) {
    throw ThrowError.FIELD_IS_INVALID('areaCodes must be a list of string')
  }

  await next()
}
