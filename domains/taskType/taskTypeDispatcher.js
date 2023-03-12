// @flow
import R from 'ramda'
import { type UpdateTodoInput } from './utils/type'
import { type Todo, type ITodoRepo } from '../../models/implementations/todoRepo'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'
import { ValidateError, CreditWalletFailed } from '../../constants/error'
import { type IAcceptTrip } from './acceptTrip'
import { type IPickup } from './pickUp'
import { type IDelivery } from './delivery'
import { type IReturn } from './return'
import { type TransformTodoResponse } from './utils/index'
import { isTaskAcceptTrip, isTaskPickup, isTaskDelivery, isTaskReturn } from '../../utils/task.util'
import { IFleetApiService } from '../../adapters/restClient/fleet'

type GetTaskTypeAndTodo = { taskType: string, todo: Todo }

export interface ITaskTypeDispatcher {
  dispatch(todoId: string, input: UpdateTodoInput): Promise<TransformTodoResponse>;
}

export class TaskTypeDispatcher implements ITaskTypeDispatcher {
  TodoRepository: ITodoRepo
  AcceptTrip: IAcceptTrip
  PickUp: IPickup
  Delivery: IDelivery
  Return: IReturn
  FleetApiService: IFleetApiService

  constructor(
    TodoRepository: ITodoRepo,
    AcceptTrip: IAcceptTrip,
    PickUp: IPickup,
    Delivery: IDelivery,
    Return: IReturn,
    FleetApiService: IFleetApiService,
  ) {
    this.TodoRepository = TodoRepository
    this.AcceptTrip = AcceptTrip
    this.PickUp = PickUp
    this.Delivery = Delivery
    this.Return = Return
    this.FleetApiService = FleetApiService
  }

  async getTaskTypeAndTodo(todoId: string): Promise<GetTaskTypeAndTodo> {
    const todo = await this.TodoRepository.getTodo(todoId, {
      populate: [
        {
          path: 'taskId',
          populate: [{ path: 'tripId' }, { path: 'taskTypeId' }],
        },
        {
          path: 'todoType',
        },
      ],
    })

    const taskType = R.path(['taskId', 'taskTypeId', 'code'], todo)

    return { taskType, todo }
  }

  async taskTypeAcceptTrip(todo: Todo, input: UpdateTodoInput) {
    const { metadata } = todo.taskId.tripId
    const { userId } = input
    const ticketId = R.path(['dispatch', 'fleet', 'ticketId'], metadata)

    const hasStaffInStaffOrderTicket = await this.hasStaffInStaffOrderTicket(ticketId, userId)

    if (!hasStaffInStaffOrderTicket) {
      throw new CreditWalletFailed(null, null, 'acceptTrip.error.accept.noStaffOrderTicket')
    }

    return this.AcceptTrip.process(todo, input)
  }

  async taskTypePickup(todo: Todo, input: UpdateTodoInput) {
    return this.PickUp.process(todo, input)
  }

  async taskTypeDelivery(todo: Todo, input: UpdateTodoInput) {
    return this.Delivery.process(todo, input)
  }

  async taskTypeReturn(todo: Todo, input: UpdateTodoInput) {
    return this.Return.process(todo, input)
  }

  async hasStaffInStaffOrderTicket(orderTicket: string, userId: string) {
    const setFilterStaffDispatch = `search=${JSON.stringify({
      orderTicket,
      'staffsInfo.userId': userId,
    })}`

    const response = await this.FleetApiService.getStaffsOrderTicket(setFilterStaffDispatch)
    return Boolean(R.path(['total'], response))
  }

  async dispatch(todoId: string, input: UpdateTodoInput) {
    const { taskType, todo } = await this.getTaskTypeAndTodo(todoId)

    const { _id: taskId } = todo.taskId

    const { _id: tripId, orderId, orderReferenceId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)

    const { userId } = input

    const logMetadata = {
      event: 'task_type_dispatcher',
      taskType,
      todoId,
      tripId,
      taskId,
      userId,
      orderId,
      consignment,
      orderReferenceId,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      if (isTaskAcceptTrip(taskType)) {
        const response = await this.taskTypeAcceptTrip(todo, input)
        logger.info(responseTime(logMetadata), input)
        return response
      }

      if (isTaskPickup(taskType)) {
        const response = await this.taskTypePickup(todo, input)
        logger.info(responseTime(logMetadata), input)
        return response
      }

      if (isTaskReturn(taskType)) {
        const response = await this.taskTypeReturn(todo, input)
        logger.info(responseTime(logMetadata), input)
        return response
      }

      if (isTaskDelivery(taskType)) {
        const response = await this.taskTypeDelivery(todo, input)
        logger.info(responseTime(logMetadata), input)
        return response
      }

      throw new ValidateError(`Task type code value not one of [ACCEPT_TRIP, PICKUP, DELIVERY]`)
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, JSON.stringify(input))
      throw err
    }
  }
}
