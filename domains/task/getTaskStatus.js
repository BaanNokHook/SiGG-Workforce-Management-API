// @flow
import TaskRepository from '../../models/task.repository'
import { TASK_STATUS } from '../../models/task.repository'

interface GetTaskStatusResponse {
  orderId: string;
  taskId: string;
  status: 'PENDING' | 'TODO' | 'DOING' | 'DONE' | 'FAILED' | 'CANCELLED' | 'REJECTED';
}

export default async function getTaskStatus(orderId: string): GetTaskStatusResponse {
  const tasks = await TaskRepository.find(
    {
      orderId,
    },
    {
      populate: [
        {
          path: 'todos',
        },
      ],
      limit: 1,
      page: 1,
      sort: { updatedAt: -1 },
    },
  )

  const task = tasks.data[0]
  const status = getStatus(task.status, task.todos)

  return {
    orderId,
    taskId: task._id,
    status,
  }
}

const getStatus = (status: string, todo: any): string => {
  if (status === TASK_STATUS.TODO) {
    return 'Receive Task'
  } else if (status === TASK_STATUS.FAILED || status === TASK_STATUS.PENDING) {
    return 'Scheduling'
  } else if (status === TASK_STATUS.DOING) {
    return getDoingTodo(todo)
  } else if (status === TASK_STATUS.DONE) {
    return 'Close'
  }
}

const getDoingTodo = (todo: any): string => {
  let _todo = []
  todo.forEach((item) => {
    if (item.title.en === 'SET OFF') {
      _todo.push({ status: 'Set off', createdAt: item.createdAt, updatedAt: item.updatedAt })
    } else if (item.title.en === 'ENTER SITE') {
      _todo.push({ status: 'Enter site', createdAt: item.createdAt, updatedAt: item.updatedAt })
    }
  })

  _todo.sort((a, b) => {
    return new Date(a.updatedAt) - new Date(b.updatedAt)
  })

  return _todo[_todo.length - 1] ? _todo[_todo.length - 1].status : ''
}
