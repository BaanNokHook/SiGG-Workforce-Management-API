import config from '../../config/index'
import baseHttp from '../../utils/baseHttp.util'

const {
  routeHttp: { authUrl },
} = config
export default baseHttp(authUrl)
