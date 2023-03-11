export default {
  uri: process.env.KAFKA_BROKERS,
  topic: {
    tmsTodo: 'tms.todo',
  },
  // secret should be env
  key: '97ac57b0-6711-11e9-9b0b-e141e0792bcd-1',
}
