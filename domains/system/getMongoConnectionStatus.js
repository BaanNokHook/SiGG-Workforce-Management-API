import mongoose from 'mongoose'

export default () => {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'Disconnected'
    case 1:
      return 'Connected'
    case 2:
      return 'Connecting'
    case 3:
      return 'Disconnecting'
    default:
      return mongoose.connection.readyState
  }
}
