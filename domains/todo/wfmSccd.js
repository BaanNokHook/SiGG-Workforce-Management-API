import { Types } from 'mongoose'
import staffRepository from '../../models/staff.repository'
import ThrowError from '../../error/basic'
import R from 'ramda'
import { TodoTypes, TaskCreator } from './events/updateTodoEvent/handler/type'

export const checkSameStaffInTodo = async (todoExists, todo, ctx) => {
  const isSCCDTask =
    R.path(
      ['taskId', 'information', 'metaInformation', 'baseInformation', 'createUser'],
      todoExists,
    ) === TaskCreator.SCCD

  const todoType = R.path(['todoType', 'name'], todo)

  if (isSCCDTask && todoType === TodoTypes.ACCEPT_TASK) {
    const staffsFromTask = R.path(['taskId', 'staffs'], todoExists)
    const { 'project-id': projectId, 'company-id': companyId } = ctx.headers
    const userId = ctx.user && ctx.user.userId
    const responseFindStaff = await staffRepository.find({
      userId: userId,
      companyId: companyId,
      projectIds: projectId,
    })

    if (
      responseFindStaff.data.length === 0 ||
      (responseFindStaff.data.length > 0 && !staffsFromTask.includes(responseFindStaff.data[0]._id))
    ) {
      throw ThrowError.UPDATE_TODO_FAILED({
        message: `Fail to update accepted todo in this task because it isn't your owner`,
      })
    }
  }
}
