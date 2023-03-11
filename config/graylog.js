export default {
  host: process.env.LOGGING_HOST,
  port: process.env.LOGGING_PORT,
  service: process.env.LOGGING_SERVICE,
  url: {
    staging: 'http://logging.kube.sendit.asia',
    local: 'http://logging.kube.sendit.asia',
    development: 'http://logging.kube.sendit.asia',
    production: 'http://logging.kube.sendit.asia',
  },
}
