import R from 'ramda'
import ThrowError from '../../../../../error/basic'
import { type Task } from '../../../../../models/implementations/taskRepo'
import { TaskStatus } from '../../../../../constants/task'
import { TodoTypes, TaskCreator } from './type'

const updateTodoTypes = [TodoTypes.ACCEPT_TASK]
export default class UpdateTodoWFMAPI {
  constructor(wfmApiTsService) {
    this.wfmApiTsService = wfmApiTsService
  }

  isSCCDTask(task: Task): boolean {
    const taskCreate = R.path(
      ['information', 'metaInformation', 'baseInformation', 'createUser'],
      task,
    )
    return taskCreate === TaskCreator.SCCD
  }

  shouldUpdate(task: Task, todoType: string): boolean {
    if (task.status === TaskStatus.DONE) return false
    if (!updateTodoTypes.includes(todoType)) return false
    if (!this.isSCCDTask(task)) return false
    return true
  }

  async updateTodoToWfmAPI({ todo }) {
    const task = R.path(['taskId'], todo)
    const todoType = R.path(['todoType', 'name'], todo)
    const staffs = R.path(['staffs'], task)
    if (!this.shouldUpdate(task, todoType)) return

    // wfm sccd work
    try {
      const body = { staffId: String(staffs[0]) }
      await this.wfmApiTsService.put({
        thing: 'v1/sccd/updateAcceptedTask',
        id: todo.taskId._id,
        body: body,
      })
    } catch (err) {
      throw ThrowError.NOT_FOUND({
        message: `Task ${todo.taskId._id}  for reschedule not found in reschedule data`,
      })
    }

    return
  }
}
