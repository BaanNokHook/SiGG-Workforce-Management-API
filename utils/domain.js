// @flow
import R from 'ramda'
import mongoose from 'mongoose'
import moment from 'moment-timezone'
import ThrowError from '../error/basic'
import { ResponseMessage } from './domainTypes'

export const findAndUpdateOrCreate = async (repo: any, filter: any, data: any) => {
  let obj = await repo.findOne(filter)
  if (obj) {
    obj = await repo.update(filter, R.omit(['_id'], data))
  } else {
    obj = await repo.create(data)
  }
  return obj
}

export const upsert = async (repo: any, filter: any, data: any) => {
  let obj = await repo.findOne(filter)
  if (obj) {
    obj = await repo.update(filter, data)
  } else {
    obj = await repo.create(data)
  }
  return obj
}

export const findOrCreate = async (repo, filter, data) => {
  let obj = await repo.findOne(filter)
  if (!obj) {
    obj = await repo.create(data)
  }
  return obj
}
export const alreadyExistThrowError = async (repo, filter) => {
  const obj = await repo.findOne(filter)
  if (obj) throw ThrowError.ALREADY_EXIST(filter)
  return true
}

export const findOneWithOutThrow = async (repo, filter, option = {}) => {
  const obj = await repo.findOne(filter, option)
  return obj
}

export const findWithOutThrow = async (repo, filter, option = {}) => {
  const obj = await repo.find(filter, option)
  return obj
}

export const checkFind = async (repo, filter, option = {}) => {
  const arr = await repo.find(filter, option)
  if (!arr) throw ThrowError.NOT_FOUND(filter)
  return arr.data
}

export const checkFindOne = async (repo, filter, option = {}) => {
  const obj = await repo.findOne(filter, option)
  if (!obj) throw ThrowError.NOT_FOUND(filter)
  return obj
}

export const checkFindOneWithToObject = async (repo, filter, option = {}) => {
  const obj = await repo.findOne(filter, option)
  if (!obj) throw ThrowError.NOT_FOUND(filter)
  return { ...obj.toObject() }
}

export const checkUpdate = async (repo, filter, data) => {
  const obj = await repo.update(filter, data, { new: true })
  if (!obj) throw ThrowError.NOT_FOUND(filter)
  return obj
}

export const checkDelete = async (repo, filter) => {
  const obj = await repo.delete(filter)
  if (!obj) throw ThrowError.NOT_FOUND(filter)
  return obj
}

export const findOneAndRestore = async (repo, filter) => {
  const obj = await repo.model.findOneDeleted(filter)
  if (!obj) throw ThrowError.NOT_FOUND(filter)
  const restoreObj = await repo.model.restore(filter)
  return restoreObj
}

export const isValidEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const isValidTime = (time: String) => {
  const validTime = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/
  return validTime.test(String(time))
}

export const compareTime = (startTime: Date, endTime: Date) => {
  let errors = {}
  const startTimeDate = new Date(startTime)
  const endTimeDate = new Date(endTime)
  const validate = startTimeDate <= endTimeDate
  if (isValidTime(startTime) && isValidTime(endTime) && !validate) {
    errors = {
      ...errors,
      startTime: 'less than or equal to end time',
      endTime: 'more than or equal to start time',
    }
  }
  return errors
}

export const isRequiredField = (obj: any, validate: any) => {
  let errors = {}
  Object.keys(validate).forEach(key => {
    if (!R.path([key], obj) || R.isEmpty(R.path([key], obj))) {
      errors = {
        ...errors,
        [key]: `field is required`,
      }
    } else if (
      (key === '_id' || R.path([key, 'type'], validate) === 'id') &&
      !mongoose.Types.ObjectId.isValid(obj[key])
    ) {
      errors = {
        ...errors,
        [key]: `field not valid type mongoose ObjectId`,
      }
    } else if (R.path([key, 'type'], validate) === 'email' && !isEmail(obj[key])) {
      errors = {
        ...errors,
        [key]: `invalid email`,
      }
    } else if (R.path([key, 'type'], validate) === 'roleType' && !isRoleType(obj[key])) {
      errors = {
        ...errors,
        [key]: `invalid type`,
      }
    }
  })

  if (!R.isEmpty(errors)) throw ThrowError.FIELD_IS_REQUIRED(errors)
  return true
}

export const filterMinTime = (accumulator, currentValue) => {
  if (typeof currentValue !== 'undefined') {
    if (accumulator.isAfter(currentValue)) {
      return currentValue
    }
    return accumulator
  }
}

export const filterMaxTime = (accumulator, currentValue) => {
  if (typeof currentValue !== 'undefined') {
    if (accumulator.isBefore(currentValue)) {
      return currentValue
    }
    return accumulator
  }
}

export const objectIdValidate = id => mongoose.Types.ObjectId.isValid(id)

export const objectIdsValidate = async (arr: array) => {
  if (!arr.every(val => objectIdValidate(val))) {
    throw new Error('Invalid TaskId')
  }
}

export const generateTripId = (extensionType = '') =>
  `TR${extensionType[0] || ''}-${moment().format('YYYYMMDDHHMMSS')}`

export const generateTaskId = (extensionType = '') =>
  `TA${extensionType[0] || ''}-${moment().format('YYYYMMDDHHMMSS')}`

export const getKeyIdsDefault = R.curry(obj => {
  if (R.isNil(obj)) {
    return []
  }
  return R.pluck(['_id'], obj)
})

export const isArrayEmpty = (key: string) => (obj: any) => {
  const getData = R.path([key], obj)
  if (getData && R.type(getData) === 'Array' && getData.length >= 1 && !R.isEmpty(getData)) {
    return false
  }
  return true
}

export const genResponseMessageForTodo = (
  responseMessage: ResponseMessage,
  status: 'failure' | 'success',
  todoDetail: any,
) => {
  const currentTime = moment.tz('Asia/Bangkok').format('HH:mm')
  const value = R.pathOr('', responseMessage[status].fromPath, todoDetail)
  const genDataTitle = R.keys(responseMessage[status].title).reduce((acc, key) => {
    acc[key] = responseMessage[status].title[key].replace(/{{VALUE}}/, value)
    return acc
  }, {})

  const genDataMessage = R.keys(responseMessage[status].message).reduce((acc, key) => {
    acc[key] = responseMessage[status].message[key].replace(/{{VALUE}}/, value)
    acc[key] = acc[key].replace(/{{CURRENT_TIME}}/, currentTime)
    return acc
  }, {})

  return {
    title: genDataTitle,
    message: genDataMessage,
  }
}

export const roundedDecimals = (number, position) =>
  Math.round(number * 10 ** position) / 10 ** position
