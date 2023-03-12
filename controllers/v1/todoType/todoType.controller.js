import { HttpMethod, route } from '@spksoft/koa-decorator'
import listTodoType, { listDistinctTodoType } from '../../../domains/todoTypes/list'
import getTodoType from '../../../domains/todoTypes/view'

@route('/v1/todoTypes')
class TodoTypes {
  @route('/', HttpMethod.GET)
  async listTodoType(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTodoType(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:todoTypeId', HttpMethod.GET)
  async getTodoType(ctx) {
    const { todoTypeId } = ctx.params
    const options = ctx.query
    const resp = await getTodoType({ _id: todoTypeId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/distinct/:key', HttpMethod.GET)
  async getTodo(ctx) {
    const { key } = ctx.params
    const { ...options } = ctx.query
    const resp = await listDistinctTodoType(key, options)
    ctx.res.ok({ data: resp })
  }
}

export default TodoTypes
