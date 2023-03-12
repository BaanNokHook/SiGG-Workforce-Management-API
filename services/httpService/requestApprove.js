import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { system, routeHttp } = config
const { requestApproveUrl } = routeHttp
export default baseHttp(requestApproveUrl)
