import { HttpMethod, route } from '@spksoft/koa-decorator'
import { getSessionMiddleware } from 'koa-session-getter'
import createTrip from '../../../domains/trip/create'
import updateTrip from '../../../domains/trip/update'
import deleteTrip from '../../../domains/trip/delete'
import getTrip from '../../../domains/trip/view'
import listTrip from '../../../domains/trip/list'
import updateStaffOfTrip from '../../../domains/trip/updateStaffsToTrip'
import { tripDomain } from '../../../domains/trip'
import cancelTrip from '../../../domains/trip/cancelTrip'
import { validateStaffId } from '../../../utils/extension.util'
import updateDirection from '../../../domains/trip/updateDirection'
import updateMetadataWorkflow from '../../../domains/trip/updateMetadataWorkflow'
import addTaskToTrip from '../../../domains/trip/addTaskToTrip'
import restoreTrip from '../../../domains/trip/restore'
import { getTripListTodo } from '../../../domains/trip/getTripListTodo'
import { getUserActiveTrip } from '../../../domains/trip/getUserActiveTrip'
import updateMetadata from '../../../domains/trip/updateMetadata'

@route('/v1/trips')
class Trips {
  @route('/', HttpMethod.POST)
  async createTrip(ctx) {
    const { body } = ctx.request
    const resp = await createTrip(body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/cancel', HttpMethod.POST, getSessionMiddleware())
  async cancelTrip(ctx) {
    const { body } = ctx.request
    const { tripId } = ctx.params
    const resp = await cancelTrip({ _id: tripId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/active', HttpMethod.GET, getSessionMiddleware())
  async getTripActive(ctx) {
    const { search = {}, ...options } = ctx.query
    await validateStaffId(ctx.user)
    const resp = await listTrip({ ...JSON.parse(search) }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:staffId/active/list', HttpMethod.GET)
  async getTripActiveList(ctx) {
    const { staffId } = ctx.params
    const resp = await tripDomain.tripActiveList(staffId)
    ctx.res.ok({ data: resp })
  }

  @route('/active/:userId', HttpMethod.GET, getSessionMiddleware())
  async getUserActiveTrip(ctx) {
    const { userId } = ctx.params
    const userActiveTrip = await getUserActiveTrip(userId)
    ctx.res.ok({ data: userActiveTrip })
  }

  @route('/', HttpMethod.GET, getSessionMiddleware())
  async listTrip(ctx) {
    const { search = {}, ...options } = ctx.query
    const resp = await listTrip(search, options)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId', HttpMethod.GET)
  async getTrip(ctx) {
    const {
      query,
      params: { tripId },
    } = ctx
    const { search, ...options } = query
    const resp = await getTrip({ _id: tripId }, options)
    ctx.res.ok({ data: resp })
  }

  @route('/todos/:tripId', HttpMethod.GET)
  async getTripListTodo(ctx) {
    const { tripId } = ctx.params
    const resp = await getTripListTodo.getValue(tripId)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/direction', HttpMethod.PUT)
  async updateDirection(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await updateDirection(tripId, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/metadata', HttpMethod.PUT)
  async updateMetadata(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await updateMetadata(tripId, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/metadata/workflow', HttpMethod.PUT)
  async updateWorkflowMetadata(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await updateMetadataWorkflow(tripId, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/staff', HttpMethod.PUT)
  async updateStaffOfTrip(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await updateStaffOfTrip(tripId, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId', HttpMethod.PUT)
  async updateTrip(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await updateTrip({ _id: tripId }, body)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId', HttpMethod.DELETE)
  async deleteTrip(ctx) {
    const { tripId } = ctx.params
    const resp = await deleteTrip({ _id: tripId })
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/staff', HttpMethod.DELETE)
  async removeStaffFromTrip(ctx) {
    const { tripId } = ctx.params
    const resp = await tripDomain.removeStaff(tripId)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/add/tasks', HttpMethod.POST)
  async addTaskToTrip(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await addTaskToTrip({ _id: tripId }, { tasks: body.tasks })
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/restore', HttpMethod.PATCH)
  async restoreTrip(ctx) {
    const { tripId } = ctx.params
    const resp = await restoreTrip(tripId)
    ctx.res.ok({ data: resp })
  }

  @route('/:staffId/income', HttpMethod.GET)
  async getStaffIncome(ctx) {
    const { staffId } = ctx.params
    const { startAt, endAt } = ctx.query
    const resp = await tripDomain.calculatePartTimeEmployeeIncome(staffId, startAt, endAt)
    ctx.res.ok({ data: resp })
  }

  @route('/:tripId/credit/wallet', HttpMethod.PUT)
  async creditWallet(ctx) {
    const { tripId } = ctx.params
    const { body } = ctx.request
    const resp = await tripDomain.actionCreditWallet(tripId, body)
    ctx.res.ok({ data: resp })
  }
}

export default Trips
