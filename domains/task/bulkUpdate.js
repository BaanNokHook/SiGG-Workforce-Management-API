import { Types } from 'mongoose'
import TaskRepository from '../../models/task.repository'

const castObjectId = Types.ObjectId
export default async (body) => {
  const taskUpdated = await TaskRepository.model.bulkWrite(
    body.input.map((item) => ({
      updateOne: {
        filter: { _id: castObjectId(item._id) },
        update: { $set: item },
      },
    })),
  )
  return taskUpdated
}
