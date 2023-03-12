import { HttpMethod, route } from '@spksoft/koa-decorator'
import findTasks from '../../../domains/task/autoAssignTaskSupport'

@route('/support')
class Support {
  @route('/auto-assign', HttpMethod.GET)
  async listTask({ query, res }) {
    const { staffCode, ...options } = query

    const data = await findTasks(staffCode, options)

    res.ok({
      data,
    })
  }
}

export default Support
