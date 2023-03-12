import { HttpMethod, route } from '@spksoft/koa-decorator'
import createTask from '../../../domains/task/create'
import updateTask from '../../../domains/task/update'
import deleteTask from '../../../domains/task/delete'
import bulkUpdateTask from '../../../domains/task/bulkUpdate'
import getTask from '../../../domains/task/view'
import { taskStaffDomain } from '../../../domains/task/getTaskStaffs'
import listTask from '../../../domains/task/list'
import getTaskBySlotTime from '../../../domains/task/getTaskBySlotTime'
import cancelTask from '../../../domains/task/cancel'
import generateTaskSequence from '../../../domains/task/generateTaskSequence'
import startTaskConfig from '../../../domains/extension/startTaskConfig'
import { taskDomain } from '../../../domains/task/index'
import { filterAvailableStaffsByPriority } from '../../../domains/task/filterAvailableStaffsByPriority'
import { autoAssignDomain } from '../../../domains/task/autoAssignTask'
import { findTasks } from '../../../domains/task/findTasks'
import { findStatusSummary } from '../../../domains/task/findStatusSummary'
import withProjectAndCompany from '../../../middlewares/withProjectAndCompany'
import { findTasksValidator, findMonitorListTasksValidator } from './task.validator'
import { wfmFindMonitorListTasks } from '../../../domains/task/wfm/findMonitorListTasks'
import { findSLASummary } from '../../../domains/task/wfm/findSLASummary'
import { enrichESTask } from '../../../domains/task/wfm/enrichESTask'
import { CallLogsDomain } from '../../../domains/task/callLogs/callLogs.domain'

@route('/v1/tasks')
class Tasks {
  @route('/', HttpMethod.POST)
  async createTask(ctx) {
    const { body } = ctx.request
    const resp = await createTask(body)
    ctx.res.ok({ data: resp })
  }

  @route('/find', HttpMethod.POST, withProjectAndCompany(), findTasksValidator)
  async findTasks(ctx) {
    const { body, header } = ctx.request
    const { populate, select, limit, page, sort, ...bodyRequest } = body
    const options = { populate, select, limit, page, sort }
    const tasks = await findTasks(bodyRequest, options)
    ctx.res.ok({ data: tasks })
  }

  @route('/status-summary', HttpMethod.POST, withProjectAndCompany(), findTasksValidator)
  async findStatusSummary(ctx) {
    const { body, header } = ctx.request
    const { limit, page, ...bodyRequest } = body
    const options = { limit, page }
    const summary = await findStatusSummary(bodyRequest, options)
    ctx.res.ok({ data: summary })
  }

  @route('/priority/available-staffs', HttpMethod.POST)
  async filterAvailableStaffs(ctx) {
    const { body } = ctx.request
    const { staffIds, priority, windowTime, projectId } = body
    try {
      const staffs = await filterAvailableStaffsByPriority(
        staffIds,
        priority,
        windowTime,
        projectId,
      )
      ctx.res.ok({ data: staffs })
    } catch (error) {
      ctx.throw(400, 'Bad Request', { error })
    }
  }

  @route('/slottime/', HttpMethod.GET)
  async getTaskBySlotTime(ctx) {
    const { staffIds, ...options } = ctx.query
    const resp = await getTaskBySlotTime(staffIds, options)
    ctx.res.ok({ data: resp })
  }

  @route('/bulk/updateMany', HttpMethod.PUT)
  async bulkWriteTask(ctx) {
    const { body } = ctx.request
    const resp = await bulkUpdateTask(body)
    ctx.res.ok({ data: resp })
  }

  @route('/status', HttpMethod.PUT)
  async updateManyTask(ctx) {
    const { body } = ctx.request
    const { tasks } = body
    let resp
    // single update task status or multiple update task status
    if (typeof tasks === 'string') {
      resp = await taskDomain.updateSingleTaskStatus(body)
    } else {
      resp = await taskDomain.updateAllTaskStatus(body)
    }

    ctx.res.ok({ data: resp })
  }

  @route('/', HttpMethod.GET)
  async listTask(ctx) {
    const { search, ...options } = ctx.query
    const resp = await listTask(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId/startconfig', HttpMethod.GET)
  async startConfig(ctx) {
    const { taskId } = ctx.params
    const resp = await startTaskConfig(taskId)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId', HttpMethod.GET)
  async getTask(ctx) {
    const { taskId } = ctx.params
    const options = ctx.query
    const resp = await getTask({ _id: taskId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId/cancel', HttpMethod.PUT)
  async cancelTask(ctx) {
    const { taskId } = ctx.params
    const { body } = ctx.request
    const resp = await cancelTask({ ...body, taskId })
    ctx.res.ok({ data: resp })
  }

  @route('/items', HttpMethod.PUT)
  async updateItems(ctx) {
    const { body } = ctx.request
    const resp = await taskDomain.updateTasksItems(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId', HttpMethod.PUT)
  async updateTask(ctx) {
    const { taskId } = ctx.params
    const { body } = ctx.request
    const resp = await updateTask({ _id: taskId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId', HttpMethod.DELETE)
  async deleteTask(ctx) {
    const { taskId } = ctx.params
    const resp = await deleteTask({ _id: taskId })
    ctx.res.ok({ data: resp })
  }

  @route('/:taskId/staffs', HttpMethod.GET)
  async getTaskStaffs(ctx) {
    const { taskId } = ctx.params
    const resp = await taskStaffDomain.getStaffs(taskId)
    ctx.res.ok({ data: resp })
  }

  @route('/autoAssign', HttpMethod.POST)
  async autoAssign(ctx) {
    const { body } = ctx.request
    const resp = await autoAssignDomain.assignTask(body)
    ctx.res.ok({ data: resp })
  }

  @route('/sequence', HttpMethod.POST)
  async generateTaskSequence(ctx) {
    const { body } = ctx.request
    const resp = await generateTaskSequence(body)
    ctx.res.ok({ data: resp })
  }

  // This will deprecate
  @route(
    '/wfm/find-monitor-list-tasks',
    HttpMethod.POST,
    withProjectAndCompany(),
    findMonitorListTasksValidator,
  )
  async findMonitorListTasks(ctx) {
    const { body } = ctx.request
    const { limit, page, ...bodyRequest } = body
    const options = { limit, page }
    const resp = await wfmFindMonitorListTasks(bodyRequest, options)
    return resp
  }

  @route(
    '/wfm/sla/summary',
    HttpMethod.POST,
    withProjectAndCompany(),
    findMonitorListTasksValidator,
  )
  async findSLASummary(ctx) {
    const { body } = ctx.request
    const resp = await findSLASummary(body)
    ctx.res.ok({ data: resp })
  }

  @route('/wfm/:orderId/status', HttpMethod.PUT)
  async updateTaskStatusByOrderId(ctx) {
    const { orderId } = ctx.params
    const { body } = ctx.request
    const resp = await taskDomain.updateTaskStatusByOrderId(orderId, body.status)
    ctx.res.ok({ data: resp })
  }

  @route('/wfm/:orderId/information', HttpMethod.PUT)
  async updateTaskInformationByOrderId(ctx) {
    const { orderId } = ctx.params
    const { body } = ctx.request
    const resp = await taskDomain.updateTaskInformationByOrderId(
      orderId,
      body.orderInfo,
      body.updateOrder,
    )
    ctx.res.ok({ data: resp })
  }

  @route('/wfm/:orderId/multi-task-information', HttpMethod.PUT)
  async updateTaskInformationByOrderId(ctx) {
    const { orderId } = ctx.params
    const { body } = ctx.request
    const resp = await taskDomain.updateMultiTaskInformationByOrderId(
      orderId,
      body.orderInfo,
      body.updateOrder,
    )
    ctx.res.ok({ data: resp })
  }

  @route('/enrich-es-task/:id', HttpMethod.GET)
  async enrichESTask(ctx) {
    const { id } = ctx.params
    const resp = await enrichESTask(id)
    ctx.res.ok({ data: resp })
  }

  @route('/call-logs', HttpMethod.POST)
  async saveCallLogs(ctx) {
    const { body } = ctx.request
    const callLogsDomain = new CallLogsDomain()
    const resp = await callLogsDomain.save(body)
    ctx.res.ok({ data: resp })
  }
}

export default Tasks
