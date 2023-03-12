import { Types } from 'mongoose'
import TaskRepository from '../../models/task.repository'

const castObjectId = Types.ObjectId
export default async (input) => {
  const taskUpdated = await TaskRepository.model.bulkWrite(
    input.map((item) => ({
      updateOne: {
        filter: { _id: castObjectId(item._id) },
        update: { $push: item.data ? item.data : item },
      },
    })),
  )
  return taskUpdated
}
