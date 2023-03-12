import { HttpMethod, route } from '@spksoft/koa-decorator'
// import * as R from 'ramda'
// import { getSessionMiddleware } from 'koa-session-getter'
import importTaskTypes from '../../../domains/taskType/import'
import createTaskType from '../../../domains/taskType/create'
import listTaskType from '../../../domains/taskType/list'
import getTaskType from '../../../domains/taskType/view'
import updateTaskType from '../../../domains/taskType/update'
import deleteTaskType from '../../../domains/taskType/delete'
import addTaskTypeMapping from '../../../domains/taskType/addMapping'
import withProjectAndCompany from '../../../middlewares/withProjectAndCompany'
import getTaskTypeByCode from '../../../domains/taskType/viewByCode'

@route('/v1/task-types')
class TaskType {
  @route('/', HttpMethod.POST, withProjectAndCompany())
  async createTaskType(ctx) {
    const { body } = ctx.request
    const resp = await createTaskType(body)
    ctx.res.ok({ data: resp })
  }

  @route('/import', HttpMethod.POST)
  async importTaskTypes(ctx) {
    const { body } = ctx.request
    console.log(body); 
    const resp = await importTaskTypes(body)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listTaskType(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTaskType(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeId', HttpMethod.GET)
  async getTaskType(ctx) {
    const { taskTypeId } = ctx.params
    const options = ctx.query
    const resp = await getTaskType({ _id: taskTypeId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeId', HttpMethod.PUT, withProjectAndCompany())
  async updateTaskType(ctx) {
    const { taskTypeId } = ctx.params
    const { body } = ctx.request
    const resp = await updateTaskType({ _id: taskTypeId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeId', HttpMethod.DELETE, withProjectAndCompany())
  async deleteTaskType(ctx) {
    const { taskTypeId } = ctx.params
    const resp = await deleteTaskType({ _id: taskTypeId })
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeId/mapping', HttpMethod.POST, withProjectAndCompany())
  async addTaskTypeMapping(ctx) {
    const { taskTypeId } = ctx.params
    const { body } = ctx.request
    const resp = await addTaskTypeMapping({ _id: taskTypeId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/code/:taskTypeCode', HttpMethod.GET)
  async getTaskTypeByCode(ctx) {
    const { taskTypeCode } = ctx.params
    const options = ctx.query
    const resp = await getTaskTypeByCode(taskTypeCode, options)
    ctx.res.ok({ data: resp })
  }
}

export default TaskType
