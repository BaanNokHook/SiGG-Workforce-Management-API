import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { fileServiceUrl } = routeHttp
export default baseHttp(fileServiceUrl)
