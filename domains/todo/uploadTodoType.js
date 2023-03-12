import R from 'ramda'
import TodoRepository from '../../models/todo.repository'
import uploadExpireDateFile from './uploadExpireDateFile'
import { checkFindOne } from '../../utils/domain'

const validateLimitFiles = (limit, files) => {
  if (R.type(files) === 'Array' && files.length > limit) {
    throw new Error(`Not allow upload files more then ${limit} files.`)
  }
}

// eslint-disable-next-line import/prefer-default-export
export const uploadTodoType = async (todoId, data) => {
  const todoExists = await checkFindOne(TodoRepository, { _id: todoId })
  const todo = R.type(todoExists.toObject) === `Function` ? todoExists.toObject() : todoExists
  let prepareTodoData = {}

  // eslint-disable-next-line no-restricted-syntax
  for (const uploadOption of todo.uploadOptions) {
    const { fromPath } = uploadOption
    // validate limit files
    const limit = R.path(['value', 'limit'], todo)
    const isHaveLimit = R.type(limit) === 'Number'
    if (isHaveLimit) validateLimitFiles(limit, R.path(fromPath, data))

    // eslint-disable-next-line no-await-in-loop
    const fileResult = await uploadExpireDateFile(uploadOption, data, todo)
    prepareTodoData = R.isNil(fileResult) ? data : R.assocPath(fromPath, fileResult, data)
  }

  return prepareTodoData
}
