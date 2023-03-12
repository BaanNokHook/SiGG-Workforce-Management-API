import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { routeHttp } = config
const { osrmUrl } = routeHttp
export default baseHttp(osrmUrl)
