import TaskRepository from '../../models/task.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

const optionsDefault = {
  populate: [
    {
      path: 'track.todo',
      populate: { path: 'todoType' },
    },
  ],
}

export default async (filter: any, options: any) => {
  isRequiredField(filter, validate)
  const resp = await checkFindOne(TaskRepository, filter, options || optionsDefault)
  return resp
}
