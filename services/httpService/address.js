import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { addressUrl } = routeHttp
export default baseHttp(addressUrl)
