/** Constant update task status by Todo Config */
export const META_FLAG_TASK_STATUS = {
  isAccept: { status: 'TODO', fields: ['acceptedAt'] },
  isStart: { status: 'DOING', fields: ['startedAt'] },
  isLast: { status: 'DONE', fields: ['completedAt'] },
  isArrived: { fields: ['arrivedAt'] },
}

export const TodoStatus = {
  DONE: 'DONE',
  TODO: 'TODO',
}

export const POPULATE_DEFAULT_TODO = {
  populate: [{ path: 'todoType' }, { path: 'taskId', populate: 'tripId' }],
}
export const POPULATE_DEFAULT_TRIP = {
  populate: [{ path: 'tasks', populate: { path: 'todos', populate: 'todoType' } }],
}

export const ResponseStatusMessage = {
  FAILURE: 'failure',
  SUCCESS: 'success',
}
