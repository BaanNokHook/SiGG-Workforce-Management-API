import * as uuid from 'uuid'

export function generateShortUUID() {
  return uuid.v4().split('-')[0]
}
