import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { trueRydeUrl } = routeHttp
export default baseHttp(trueRydeUrl)
