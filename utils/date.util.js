import moment from 'moment'
import { ValidateError } from '../constants/error'

export function getCurrentDateTime() {
  return new Date().toISOString()
}

export function validateDateRange(options) {
  const { startAt, endAt } = options
  if (moment(startAt, 'YYYY-MM-DD HH:mm:ss').isAfter(endAt, 'YYYY-MM-DD HH:mm:ss'))
    throw new ValidateError('startAt should less than or equal endAt')
}