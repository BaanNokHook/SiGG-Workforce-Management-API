import taskRepository from '../../models/task.repository'
import todoRepository from '../../models/todo.repository'
import { checkFindOne, checkDelete, isRequiredField } from '../../utils/domain'

const validate = {
  _id: true,
}

export default async (filter: any) => {
  isRequiredField(filter, validate)
  const task = await checkFindOne(taskRepository, filter)
  if (task.todos && task.todos.length > 0) {
    const todosDeleted = task.todos.map(todoId => {
      const todoDeleted = todoRepository.delete({
        _id: todoId,
      })
      return todoDeleted
    })
    await Promise.all(todosDeleted)
  }
  const response = await checkDelete(taskRepository, filter)
  return response
}
