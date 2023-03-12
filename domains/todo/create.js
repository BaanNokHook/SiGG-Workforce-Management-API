import R from 'ramda'
import TodoRepository from '../../models/todo.repository'
import { isRequiredField } from '../../utils/domain'

const validate = {
  projectId: true,
  companyId: true,
  referenceProjectId: true,
  referenceCompanyId: true,
}

export default async (data) => {
  if (R.type(data) === 'Array') {
    data.map((_data) => isRequiredField(_data, validate))
  } else {
    isRequiredField(data, validate)
  }

  const newTodo = await TodoRepository.create(data)
  return newTodo
}
