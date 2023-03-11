import 'dotenv/config' // Only on top
import database from './database'
import system from './system'
import routeHttp from './routeHttp'
import rascal from './rascal'
import graylog from './graylog'
import kafka from './kafka'
import sms from './sms'
import urlShorten from './urlShorten'
import ondemand from './ondemand'
import wfm from './wfm'
import kong from './kong'
import elasticSearch from './elasticSearch'

export default {
  env: process.env.NODE_ENV || 'localhost',
  database,
  routeHttp,
  system,
  rascal,
  graylog,
  kafka,
  sms,
  urlShorten,
  ondemand,
  wfm,
  kong,
  elasticSearch,
  log: {
    name: process.env.APP_NAME || '4pl-tms-api',
    streams: [
      {
        type: 'stream',
        stream: process.stdout,
        level: 'debug',
      },
    ],
  },
  weomni: {
    url: process.env.WEOMNI_URL,
    clientId: process.env.WEOMNI_CLIENT_ID,
    clientSecret: process.env.WEOMNI_CLIENT_SECRET,
    projectId: process.env.WEOMNI_PROJECT_ID,
    tokenCode: process.env.WEOMNI_TOKEN_CODE,
    wallet: {
      sendit: {
        id: process.env.WEOMNI_SENDIT_WALLET_ID,
      },
    },
    driver: {
      crmChannel: process.env.WEOMNI_CRM_CHANNEL,
    },
  },
}
