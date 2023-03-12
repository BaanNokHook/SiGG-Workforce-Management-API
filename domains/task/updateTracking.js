import TaskRepository from '../../models/task.repository'

async function push(filter: any, data: any) {
  return TaskRepository.update(filter, {
    $push: {
      tracking: data,
    },
  })
}

async function pop(filter: any, val = 1) {
  return TaskRepository.update(filter, { $pop: { tracking: val } })
}

export default {
  push,
  pop,
}
