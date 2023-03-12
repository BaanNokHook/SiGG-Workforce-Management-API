// @flow
import Ajv from 'ajv'
import AjvError from 'ajv-errors'
import { ValidateError } from '../constants/error'

// https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md#type
type Type = 'number' | 'string' | 'integer' | 'boolean' | 'array' | 'object'

type Schema = {
  properties: { [key: string]: { type?: Type } | { type: Type }[] },
  required?: string[],
}

type ValidateParams = {
  schema: Schema,
  data: any,
}

export function validateData({ schema, data }: ValidateParams) {
  const ajv = new Ajv({ allErrors: true, jsonPointers: true })
  const dateTimeRegex = new RegExp(
    /^(([1-2]\d{3})-([0]?[1-9]|1[0-2])-([0-2]?[0-9]|3[0-1]) (20|21|22|23|[0-1]?\d{1}):([0-5]?\d{1}):([0-5]?\d{1}))$/
  )
  AjvError(ajv)
  ajv.addFormat('date-time-string', {
    validate: dateTimeString => dateTimeRegex.test(dateTimeString)
  })

  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (!valid) {
    throw new ValidateError(ajv.errorsText(validate.errors))
  }

  return valid
}
