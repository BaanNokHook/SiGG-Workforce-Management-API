import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { fleetUrl } = routeHttp
export default baseHttp(fleetUrl)
