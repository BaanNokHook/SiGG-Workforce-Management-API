export default {
  graylogErrorStack: process.env.GRAYLOG_ERROR_STACK === 'true',
  responseErrorStack: process.env.RESPONSE_ERROR_STACK === 'true',
  env: process.env.NODE_ENV || 'local',
  baseURI: process.env.BASE_URI,
  projectName: process.env.PROJECT_NAME,
  port: process.env.PORT,
}
