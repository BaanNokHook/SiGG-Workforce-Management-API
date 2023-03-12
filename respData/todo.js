const mapResp = todo => ({
  status: todo.status,
  completedAt: todo.completedAt,
  message: todo.message,
})

export const respUpdateTodo = todo => mapResp(todo)
