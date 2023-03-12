import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { broadcastUrl } = routeHttp
export default baseHttp(broadcastUrl)
