export default {
  uris: process.env.AMQP_URI || '',
  user: process.env.AMQP_USER || '',
  password: process.env.AMQP_PASS || '',
}
