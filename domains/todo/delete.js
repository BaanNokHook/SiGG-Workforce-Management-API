import TodoRepository from '../../models/todo.repository'
import { checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const resp = await checkDelete(TodoRepository, filter)
  return resp
}
