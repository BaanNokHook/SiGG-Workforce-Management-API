import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { ratingUrl } = routeHttp
export default baseHttp(ratingUrl)
