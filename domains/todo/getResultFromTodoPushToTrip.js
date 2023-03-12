import R from 'ramda'

export const groupMapperFieldRelate = todo => fieldRelate => ({
  field: [R.last(fieldRelate.fromPath), R.path(fieldRelate.fromPath, todo)],
  mapper: fieldRelate,
})

export const mergeResultToTripRelate = (object, data) => {
  let newObj = object
  const [key, val] = R.path(['field'], data)
  newObj = R.assocPath(data.mapper.toPath, { [key]: val }, newObj)
  newObj = R.mergeDeepRight(R.pick([data.mapper.toPath[0]], object), newObj)
  return newObj
}

export const getTripRelateFromTodo = (todo: any) => {
  const tripRelate = R.pathOr(null, ['tripRelate'], todo)
  if (!tripRelate) return {}
  const result = tripRelate.map(groupMapperFieldRelate(todo)).reduce(mergeResultToTripRelate, {})
  return result
}

export default todo => {
  const response = getTripRelateFromTodo(todo)
  return response
}
