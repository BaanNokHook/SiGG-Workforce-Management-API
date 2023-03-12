import { pathOr, map, reduce, path, filter, pipe, isEmpty } from 'ramda'
import { info, error } from 'graylog-koa-client'

type InitField = {
  name: string,
  value: any,
  logInMessage?: boolean,
}
const toObj = reduce(
  (acc, field) => ({ ...acc, [path(['name'], field)]: path(['value'], field) }),
  {},
)
const logFieldInMessage = pipe(
  filter(field => field.logInMessage),
  map(field => ({ [path(['name'], field)]: path(['value'], field) })),
)

export default (
  layer: 'SERVICE' | 'DOMAIN' | 'CONTROLLER',
  name: string,
  functionName: string,
  fields?: InitField,
) => {
  const fieldInMessage = logFieldInMessage(fields)
  const formatFieldInMessage = !isEmpty(fieldInMessage) ? JSON.stringify(fieldInMessage) : ''
  const initFileds = fields ? toObj(fields) : {}
  return {
    info: (action: string, data: any = {}, message: string = '') =>
      info(`[${layer}.${name}.${functionName}][${action}]${formatFieldInMessage} ${message}`, {
        ...initFileds,
        data: { ...data },
      }),
    error: (action: string, data: any = {}, errorObj: Error) => {
      const errorMessage = pathOr('', ['message'], errorObj)
      const errorStack = pathOr('', ['stack'], errorObj)
      return error(
        `[${layer}.${name}.${functionName}][${action}]}${formatFieldInMessage} ${errorMessage}`,
        {
          ...initFileds,
          data: { ...data },
          error: errorStack,
        },
      )
    },
  }
}
