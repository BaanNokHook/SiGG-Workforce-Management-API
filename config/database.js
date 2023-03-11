export default {
  debug: process.env.NODE_ENV === 'development' || false,
  uri: process.env.MONGO_URI,
  dbName: process.env.MONGO_DATABASE_NAME,
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
}
