import { HttpMethod, route } from '@spksoft/koa-decorator'
import listTodoFlow from '../../../domains/todoFlow/list'
import createTodoFlow from '../../../domains/todoFlow/create'
import viewTodoFlow from '../../../domains/todoFlow/view'
import deleteTodoFlow from '../../../domains/todoFlow/delete'

@route('/v1/todoflow')
class TodoTypes {
  @route('/', HttpMethod.GET)
  async listTodoFlow(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTodoFlow(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.POST)
  async createTodoFlow(ctx) {
    const { body } = ctx.request
    const resp = await createTodoFlow(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:todoFlowId', HttpMethod.GET)
  async viewTodoFlow(ctx) {
    const { todoFlowId } = ctx.params
    const options = ctx.query
    const resp = await viewTodoFlow({ _id: todoFlowId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:todoFlowId', HttpMethod.GET)
  async deleteTodoFlow(ctx) {
    const { todoFlowId } = ctx.params
    const options = ctx.query
    const resp = await deleteTodoFlow({ _id: todoFlowId }, options)
    ctx.res.ok({ data: resp })
  }
}

export default TodoTypes
