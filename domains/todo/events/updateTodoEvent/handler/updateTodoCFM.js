import R from 'ramda'
import moment from 'moment-timezone'
import ThrowError from '../../../../../error/basic'
import logger from '../../../../../libraries/logger/index'
import { UpdateTodoCFMType, TodoTypes, ActionTypesCFM, TaskCreator } from './type'
import { type Task } from '../../../../../models/implementations/taskRepo'
import { TaskStatus } from '../../../../../constants/task'

const updateTodoTypes = [TodoTypes.SET_OFF, TodoTypes.ENTER_SITE, TodoTypes.E_SIGNATURE]

export default class UpdateTodoCFM {
  constructor(cfmService, fleetService) {
    this.cfmService = cfmService
    this.fleetService = fleetService
  }

  isSCCDTask(task: Task): boolean{
    const taskCreate = R.path(['information','metaInformation','baseInformation','createUser'], task)
    return taskCreate === TaskCreator.SCCD
  }

  shouldUpdate(task: Task, todoType: string): boolean{
    if (!updateTodoTypes.includes(todoType)) return false
    if (task.status === TaskStatus.DONE) return false
    if (this.isSCCDTask(task)) return false

    return true
  }

  async update({ todo, result }: UpdateTodoCFMType) {
    const todoType = R.path(['todoType', 'name'], todo)
    const taskTypeId = R.path(['taskId', 'taskTypeId'], todo)
    const task = R.path(['taskId'], todo)
    
    if(!this.shouldUpdate(task, todoType)) return

    const staffId = R.path(['taskId', 'staffs', 0], todo)
    const staffRes = await this.fleetService.get({
      thing: 'staff',
      findBy: staffId,
      headers: {},
    })

    const staff = R.pathOr(false, ['data', 'data'], staffRes)
    if (!staff) {
      logger.error(`Staff not found`)
      throw ThrowError.NOT_FOUND('Staff not found')
    }

    const payload = await this.buildPayload({ result, todo, staff })
    return this.cfmService.updateWorkOrderStatus(payload, taskTypeId)
  }

  async buildPayload({ todo, staff }) {
    const { companyId, projectId, name: todoTypeName } = R.path(['todoType'], todo)
    const workOrderNO = R.path(['taskId', 'orderId'], todo)
    const { ticketNo, prodId } = R.path(['taskId', 'information'], todo)
    const actionDate = moment().tz('Asia/Bangkok').format('DDMMYYYYHHmmss')
    const staffCode = R.path(['metaData', 'staffCode'], staff)

    const initialPayload = {
      workOrderNO,
      productID: prodId,
      ticketNumber: ticketNo,
      actionName: `${staff.firstname} ${staff.lastname}`,
      actionDate,
      actionID: staffCode,
      updID: staffCode,
      updName: `${staff.firstname} ${staff.lastname}`,
      companyId: `${companyId}`,
      projectId: `${projectId}`,
      requestType: '2',
    }

    const payloadByTodoType = this.customPayloadByTodoType(todoTypeName)
    const payload = { ...initialPayload, ...payloadByTodoType }

    return payload
  }

  customPayloadByTodoType(todoTypeName: string) {
    switch (todoTypeName) {
      case TodoTypes.SET_OFF:
        return { actionType: ActionTypesCFM.SET_OFF }
      case TodoTypes.ENTER_SITE:
        return { actionType: ActionTypesCFM.ENTER_SITE }
      case TodoTypes.E_SIGNATURE:
        return { actionType: ActionTypesCFM.PROCESSED }
      default:
        return {}
    }
  }
}
