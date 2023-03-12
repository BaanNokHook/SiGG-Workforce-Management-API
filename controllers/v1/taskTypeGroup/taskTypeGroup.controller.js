import { HttpMethod, route } from '@spksoft/koa-decorator'
import createTaskTypeGroup from '../../../domains/taskTypeGroup/create'
import listTaskTypeGroup from '../../../domains/taskTypeGroup/list'
import getTaskTypeGroup from '../../../domains/taskTypeGroup/view'
import updateTaskTypeGroup from '../../../domains/taskTypeGroup/update'
import deleteTaskTypeGroup from '../../../domains/taskTypeGroup/delete'

@route('/v1/taskTypeGroups')
class TaskTypeGroup {
  @route('/', HttpMethod.POST)
  async createTaskTypeGroup(ctx) {
    const { body } = ctx.request
    const resp = await createTaskTypeGroup(body)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listTaskTypeGroup(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTaskTypeGroup(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeGroupId', HttpMethod.GET)
  async getTaskTypeGroup(ctx) {
    const { taskTypeGroupId } = ctx.params
    const options = ctx.query
    const resp = await getTaskTypeGroup({ _id: taskTypeGroupId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeGroupId', HttpMethod.PUT)
  async updateTaskTypeGroup(ctx) {
    const { taskTypeGroupId } = ctx.params
    const { body } = ctx.request
    const resp = await updateTaskTypeGroup({ _id: taskTypeGroupId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskTypeGroupId', HttpMethod.DELETE)
  async deleteTaskTypeGroup(ctx) {
    const { taskTypeGroupId } = ctx.params
    const resp = await deleteTaskTypeGroup({ _id: taskTypeGroupId })
    ctx.res.ok({ data: resp })
  }
}

export default TaskTypeGroup
