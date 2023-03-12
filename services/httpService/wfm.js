import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const { routeHttp } = config
const { wfmApiTsUrl } = routeHttp
export default baseHttp(wfmApiTsUrl)
