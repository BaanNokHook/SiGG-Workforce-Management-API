import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { priceCalculateUrl } = routeHttp
export default baseHttp(priceCalculateUrl)
