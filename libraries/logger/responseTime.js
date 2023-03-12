import moment from 'moment'

export default (obj: Object) => {
  const { logResponseTimeStart, ...newObj } = obj
  if (!logResponseTimeStart) return obj

  const responseTime = moment
    .duration(moment().utc().diff(moment(logResponseTimeStart).utc()))
    .asMilliseconds()

  return { ...newObj, logResponseTime: `${responseTime}ms` }
}
