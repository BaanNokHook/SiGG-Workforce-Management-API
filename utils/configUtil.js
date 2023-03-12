// @flow
export function ensureConfigKey(c: Object, key: string) {
  if (!c[key]) {
    throw new Error(`config ${key} is required`)
  }
}

export function ensureConfigKeys(c: Object, ...keys: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    ensureConfigKey(c, key)
  }
}
