import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { routeHttp } = config
const { orderUrl } = routeHttp
export default baseHttp(orderUrl)
