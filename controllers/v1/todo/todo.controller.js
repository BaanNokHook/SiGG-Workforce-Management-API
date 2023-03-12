import { HttpMethod, route } from '@spksoft/koa-decorator'
import { getSessionMiddleware } from 'koa-session-getter'
import config from '../../../config/index'
import tracking from '../../../domains/task/updateTracking'
import { taskTypeDispatcher } from '../../../domains/taskType/index'
import createTodo from '../../../domains/todo/create'
import deleteTodo from '../../../domains/todo/delete'
import listTodo from '../../../domains/todo/list'
import updateTodo from '../../../domains/todo/update'
import getTodo from '../../../domains/todo/view'
import logger from '../../../libraries/logger'
import TodoRepository from '../../../models/todo.repository'
import { LANGUAGE } from '../../../libraries/i18n/translator'

@route('/v1/todos')
class Todos {
  @route('/', HttpMethod.POST)
  async createTodo(ctx) {
    const { body } = ctx.request
    const resp = await createTodo(body)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listTodo(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTodo(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:todoId', HttpMethod.GET)
  async getTodo(ctx) {
    const { todoId } = ctx.params
    const options = ctx.query
    const resp = await getTodo({ _id: todoId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:todoId', HttpMethod.PUT, getSessionMiddleware())
  async updateTodo(ctx) {
    const { todoId } = ctx.params
    const { body } = ctx.request
    const { 'project-id': projectId, 'company-id': companyId, language = LANGUAGE.TH } = ctx.headers
    const userId = ctx.user && ctx.user.userId
    const ondemandProjectIds = JSON.parse(config.ondemand.projectIDs)
    const isOndemandProject = ondemandProjectIds.includes(projectId)
    const metadata = { todoId, companyId, projectId, userId, isOndemandProject, body }
    logger.info({ event: 'REQUEST_UPDATE_TODO' }, metadata)

    if (isOndemandProject) {
      const input = {
        projectId,
        companyId,
        userId,
        language,
        ...body,
      }

      const response = await taskTypeDispatcher.dispatch(todoId, input)

      ctx.res.ok({ data: response })
    }
    // wfm true-ryde
    else {
      const todo = await TodoRepository.findOne({ _id: todoId }, { populate: [{ path: 'taskId' }] })
      const resp = await updateTodo({ _id: todoId }, body, ctx)
      const { id, firstname, lastname, phone } = ctx.user.user
      await tracking.push(
        { _id: todo.taskId._id },
        {
          type: todo.title.en,
          creator: {
            id,
            firstname,
            lastname,
            phone,
          },
          metadata: {
            source: 'HUMAN',
          },
          createdAt: new Date(),
        },
      )
      ctx.res.ok({ data: resp })
    }
  }

  @route('/:todoId', HttpMethod.DELETE)
  async deleteTodo(ctx) {
    const { todoId } = ctx.params
    const resp = await deleteTodo({ _id: todoId })
    ctx.res.ok({ data: resp })
  }
}

export default Todos
