// #### Example ####
// import UserRepository from '../models/user/user.repository'
import TodoType from '../models/todoType.repository'
import ParcelRepository from '../models/parcel.repository'
import TodoRepository from '../models/todo.repository'
import TaskRepository from '../models/task.repository'
import TripRepository from '../models/trip.repository'

export default async () => {
  // await ParcelRepository.model.remove()
  // await TodoRepository.model.remove()
  // await TaskRepository.model.remove()
  const validTodoType = await TodoType.findOne({ name: 'SIGN' })
  if (!validTodoType) {
    await TripRepository.model.remove()
    const todoInit = [
      {
        name: 'SIGN',
        description: 'You must sign document something for customer requied',
        extension: ['DOCUMENT', 'PARCEL'],
      },
      {
        name: 'CAMERA',
        description: 'Take a photo for credit confirm',
        extension: ['ALL'],
      },
      {
        name: 'QRCODE',
        description: 'QR Code for confirm code from item',
        extension: ['ALL'],
      },
      {
        name: 'FOOD_DELIVERY',
        description: 'Send food to client',
        extension: ['FOOD'],
      },
      {
        name: 'BUY_FOOD',
        description: 'Buy food for client',
        extension: ['FOOD'],
      },
    ]
    await Promise.all(todoInit.map(item => TodoType.create(item)))
  }
}
