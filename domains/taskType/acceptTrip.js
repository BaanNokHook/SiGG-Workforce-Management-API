// @flow
import R from 'ramda'
import { type ITodoRepo, type Todo, type TodoStatus } from '../../models/implementations/todoRepo'
import { type ITaskRepo, type Task } from '../../models/implementations/taskRepo'
import {
  type ITripRepo,
  type WindowTime,
  type Trip,
  type TripsPagination,
} from '../../models/implementations/tripRepo'
import { type IUrlShortenApiService } from '../../adapters/restClient/urlShorten'
import { IDispatchApiService, Ticket } from '../../adapters/restClient/dispatch'
import { IFleetApiService } from '../../adapters/restClient/fleet'
import { type UpdateTodoInput, type MetadataWorkflows } from './utils/type'
import { IWorkflow } from '../../libraries/melonade/melonadeProducer'
import config from '../../config/index'
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'
import {
  getTransportWorkflow,
  transformTodoResponse,
  type TransformTodoResponse,
} from './utils/index'
import { validateData } from '../../utils/validate'
import { ValidateError } from '../../constants/error'
import { updateTripDetailStatus } from './updateTrip'
import { TASK_STATUS } from '../../models/task.repository'
import { TRIP_STATUS } from '../../models/trip.repository'
import { TODO_STATUS } from '../../models/todo.repository'
import { filterDeliveryTasks, getRefOrderIds } from '../../utils/task.util'
import { isAllowedToMultipleAcceptTrip, getMultipleAcceptTripLimit } from '../../utils/trip.util'
import { GenerateSequenceId } from '../generateSequenceId/generateSequenceId'
import { TripDomain } from '../trip/trip'
import updateMetadata from '../trip/updateMetadata'
import { CreditWalletAcceptDomain } from '../weomni/creditWalletAccept'
import { isUseCreditWallet } from '../../utils/weomni.util'

type ITracking = {
  refOrderId: string,
  trackingURL: string,
}

type IWorkFlowTransport = {
  userId: string,
  orderId: string,
  orderReferenceId: string,
  staffId: string,
  trackingURLs: ITracking[],
  companyId: string,
  projectId: string,
  trip: {
    _id: string,
    metadata: any,
    windowTime: WindowTime,
  },
}

type ICourier = {
  _id: string,
  projectId: string,
  name: string,
  description: string,
}

export interface IAcceptTrip {
  process(todo: Todo, acceptTrip: UpdateTodoInput): Promise<TransformTodoResponse>;
}
export class AcceptTrip implements IAcceptTrip {
  TodoRepository: ITodoRepo
  TaskRepository: ITaskRepo
  TripRepository: ITripRepo
  Workflow: IWorkflow
  FleetApiService: IFleetApiService
  DispatchApiService: IDispatchApiService
  UrlShortenApiService: IUrlShortenApiService
  generateSequenceId: GenerateSequenceId
  tripDomain: TripDomain
  eventName: string
  creditWalletAcceptDomain: CreditWalletAcceptDomain

  constructor(
    TodoRepository: ITodoRepo,
    TaskRepository: ITaskRepo,
    TripRepository: ITripRepo,
    Workflow: IWorkflow,
    FleetApiService: IFleetApiService,
    DispatchApiService: IDispatchApiService,
    UrlShortenApiService: IUrlShortenApiService,
    generateSequenceId: GenerateSequenceId,
    tripDomain: TripDomain,
    creditWalletAcceptDomain: CreditWalletAcceptDomain,
  ) {
    this.TodoRepository = TodoRepository
    this.TaskRepository = TaskRepository
    this.TripRepository = TripRepository
    this.Workflow = Workflow
    this.FleetApiService = FleetApiService
    this.DispatchApiService = DispatchApiService
    this.UrlShortenApiService = UrlShortenApiService
    this.generateSequenceId = generateSequenceId
    this.tripDomain = tripDomain
    this.eventName = 'ondemand_accept_trip'
    this.creditWalletAcceptDomain = creditWalletAcceptDomain
  }

  async generateTrackingUrl(refOrderId: string, task: Task) {
    const trackingURL = await this.UrlShortenApiService.generateUrl({
      url: `${config.ondemand.webTrackingUri}/recipient/tracking/${refOrderId}/${task.taskId}`,
    })
    return trackingURL
  }

  async getTrackingURLs(workflowOrderId: string, tasks: Task[]) {
    const trackingURLs = Promise.all(
      tasks.map(async (task) => {
        const orderIds = getRefOrderIds(task)
        const refOrderId = orderIds && orderIds.length > 0 ? orderIds[0] : workflowOrderId
        const trackingURL = await this.generateTrackingUrl(refOrderId, task)
        return {
          refOrderId,
          trackingURL,
        }
      }),
    )
    return trackingURLs
  }

  async getTrip(tripId: string) {
    const trip = await this.TripRepository.getTripById(tripId, {
      populate: [
        {
          path: 'tasks',
          populate: [{ path: 'taskTypeId' }],
        },
      ],
    })
    return trip
  }

  async getStaff(userId: string, orderId: string) {
    const startTime = new Date()
    const staff = await this.FleetApiService.getStaff(userId)
    const responseTime = new Date() - startTime
    logger.info({
      event: this.eventName,
      action: 'get_staff',
      userId,
      orderId,
      responseTime,
    })
    return staff
  }

  startTransportWorkflow(todo: Todo, input: IWorkFlowTransport) {
    const metadataWorkflows = R.pathOr([], ['taskId', 'tripId', 'metadata', 'workflows'], todo)
    const { transactionId, workflowRev, workflowName } = getTransportWorkflow(metadataWorkflows)

    const { _id: tripId, orderId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)

    this.Workflow.start(transactionId, { name: workflowName, rev: String(workflowRev) }, input)

    logger.info(
      {
        event: this.eventName,
        action: 'start_transport_workflow',
        workflowName,
        workflowTransactionId: transactionId,
        tripId,
        orderId,
        consignment,
      },
      input,
    )
  }

  // includes auto assign courier and manual assign courier
  completeAssignCourierWorkflow(todo: Todo) {
    const { _id: tripId, orderId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)
    const metadataWorkflows: MetadataWorkflows = R.pathOr(
      [],
      ['taskId', 'tripId', 'metadata', 'workflows'],
      todo,
    )
    const workflowWaitingAcceptTrip = metadataWorkflows.find(
      (workflow) => workflow.taskName === 'tms_waiting_accept_trip',
    )

    if (workflowWaitingAcceptTrip) {
      const { transactionId, taskId } = workflowWaitingAcceptTrip
      this.Workflow.complete(
        { transactionId, taskId },
        {
          status: [
            {
              status: 'TMS_WAITING_ACCEPT_TRIP_COMPLETED',
              updatedAt: new Date(),
            },
          ],
        },
      )
      logger.info({
        event: this.eventName,
        action: 'complete_assign_courier_workflow',
        workflowTransactionId: transactionId,
        workflowTaskId: taskId,
        tripId,
        orderId,
        consignment,
      })
    }
  }

  async isProcessingAutoAssignCourier(ticketId: string): Promise<boolean> {
    if (!ticketId) return false

    try {
      const ticket: Ticket = await this.DispatchApiService.getTicket(ticketId)
      return ticket && ticket.status === 'PROCESSING'
    } catch (error) {
      return false
    }
  }

  async updateDispatchingTicketStatus(todo: Todo): Promise<void> {
    await Promise.all([
      this.updateDispatchingOrderTicket(todo),
      this.updateDispatchingFleetTicket(todo),
    ])
  }

  async updateDispatchingOrderTicket(todo: Todo): Promise<null | Ticket> {
    const { _id: tripId, orderId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)
    const ticketId = R.pathOr(null, ['dispatch', 'order', 'ticketId'], metadata)
    const token = R.pathOr(null, ['dispatch', 'order', 'token'], metadata)

    const logMetadata = {
      event: this.eventName,
      action: 'update_dispatch_order_ticket',
      tripId,
      orderId,
      consignment,
      ticketId,
      token,
      logResponseTimeStart: new Date().getTime(),
    }

    const isProcessingAutoAssignCourier = await this.isProcessingAutoAssignCourier(ticketId)
    if (!isProcessingAutoAssignCourier) {
      logger.info({ ...responseTime(logMetadata), isProcessingAutoAssignCourier })
      return null
    }

    const updateDispatch = await this.DispatchApiService.updateTicket(ticketId, token)
    logger.info({ ...responseTime(logMetadata), isProcessingAutoAssignCourier })

    return updateDispatch
  }

  async updateDispatchingFleetTicket(todo: Todo): Promise<null | Ticket> {
    const { _id: tripId, orderId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)
    const ticketId = R.pathOr(null, ['dispatch', 'fleet', 'ticketId'], metadata)
    const token = R.pathOr(null, ['dispatch', 'fleet', 'token'], metadata)

    const logMetadata = {
      event: this.eventName,
      action: 'update_dispatch_fleet_ticket',
      tripId,
      orderId,
      consignment,
      ticketId,
      token,
      logResponseTimeStart: new Date().getTime(),
    }

    const isProcessingAutoAssignCourier = await this.isProcessingAutoAssignCourier(ticketId)
    if (!isProcessingAutoAssignCourier) {
      logger.info({ ...responseTime(logMetadata), isProcessingAutoAssignCourier })
      return null
    }

    const updateDispatch = await this.DispatchApiService.updateTicket(ticketId, token)
    logger.info({ ...responseTime(logMetadata), isProcessingAutoAssignCourier })

    return updateDispatch
  }

  validateAcceptTrip(todo: Todo) {
    const { status: todoStatus } = todo
    const { status: taskStatus } = todo.taskId
    const { status: tripStatus } = todo.taskId.tripId

    const isActiveTrip = tripStatus === 'PENDING'
    const isActiveTask = taskStatus === 'PENDING'
    const isActiveTodo = todoStatus === 'TODO'

    if (!isActiveTrip) {
      throw new ValidateError(null, null, 'acceptTrip.error.accept.inactiveTrip')
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, 'acceptTrip.error.accept.inactiveTask')
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, 'acceptTrip.error.accept.inactiveTodo')
    }
  }

  getCompanyName(companyId: string, couriers: ICourier[] = []) {
    if (couriers.length === 0) return ''

    const _courier = couriers.find((courier) => String(courier._id) === String(companyId))
    if (!_courier || !_courier.name) return ''

    return _courier.name
  }

  validateMultipleAcceptTrip(tripActiveListPaginate: TripsPagination, tripMetadata: any) {
    const currentAcceptTripTotal = tripActiveListPaginate.total
    const acceptTripLimit = getMultipleAcceptTripLimit(tripMetadata)

    const isAcceptTripMoreThanOrEqualLimit = currentAcceptTripTotal >= acceptTripLimit

    if (acceptTripLimit && isAcceptTripMoreThanOrEqualLimit) {
      throw new ValidateError(null, null, 'acceptTrip.error.accept.totalAcceptedMaxLimit')
    }
  }

  async handleMultipleAcceptTrip(staffId: string, trip: Trip) {
    const { _id: tripId, metadata } = trip
    const tripActiveListPaginate = await this.tripDomain.tripActiveList(staffId)

    this.validateMultipleAcceptTrip(tripActiveListPaginate, metadata)

    const pickFirstTripActiveMetadata = R.path(['data', '0', 'metadata'], tripActiveListPaginate)
    const acceptTripReferenceId = await this.generateSequenceId.acceptTripReferenceId(
      pickFirstTripActiveMetadata,
    )
    // add acceptTripReferenceId to trip
    await this.TripRepository.update(tripId, {
      'metadata.acceptTripReferenceId': acceptTripReferenceId,
    })
  }

  async process(todo: Todo, acceptTrip: UpdateTodoInput) {
    const { _id: todoId, todoType, result } = todo
    const todoTypeCode = todoType.code
    const todoStatusBeforeUpdate: TodoStatus = todo.status

    const { _id: taskId, status: taskStatus } = todo.taskId
    const taskStatusBeforeUpdate = taskStatus
    const taskTypeCode = R.path(['taskTypeId', 'code'], todo.taskId)

    const {
      _id: tripId,
      status: tripStatus,
      orderId,
      orderReferenceId,
      metadata,
      companyId,
      projectId,
      windowTime,
    } = todo.taskId.tripId
    const tripStatusBeforeUpdate = tripStatus
    const consignment = R.pathOr('', ['consignment'], metadata)

    const { userId } = acceptTrip
    const _acceptTrip = {
      ...acceptTrip,
      date: new Date(),
    }

    const logMetadata = {
      event: this.eventName,
      action: 'process',
      userId,
      tripId,
      taskId,
      todoId,
      orderId,
      consignment,
      orderReferenceId,
      logResponseTimeStart: new Date().getTime(),
    }

    let holdWithdrawal = null

    try {
      validateData({
        schema: {
          properties: {
            date: { format: 'date' },
            userId: { type: 'string' },
            lat: {
              maximum: 90,
              type: 'number',
              errorMessage: 'must be an Integer between -90 to 90',
            },
            lng: {
              maximum: 180,
              type: 'number',
              errorMessage: 'must be an Integer between -180 to 180',
            },
          },
          required: ['date', 'userId', 'lat', 'lng'],
        },
        data: _acceptTrip,
      })

      this.validateAcceptTrip(todo)

      const { lat, lng, date } = _acceptTrip

      const [staff, trip] = await Promise.all([
        this.getStaff(userId, orderId),
        this.getTrip(tripId),
      ])

      const { _id: staffId } = staff
      if (isAllowedToMultipleAcceptTrip(trip.metadata)) {
        await this.handleMultipleAcceptTrip(staffId, trip)
      }

      if (isUseCreditWallet(trip.metadata)) {
        holdWithdrawal = await this.creditWalletAcceptDomain.holdWithdrawal(userId, trip)
      }

      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { lat, lng, date, userId },
          status: TODO_STATUS.DONE,
        }),
        this.TaskRepository.updateStatus(taskId, TASK_STATUS.DONE),
        this.updateDispatchingTicketStatus(todo),
      ])

      this.completeAssignCourierWorkflow(todo)

      await updateTripDetailStatus({
        TripRepo: this.TripRepository,
        tripId,
        tripStatus: TRIP_STATUS.DOING,
        todo,
      })

      const workflowOrderId = trip.metadata.orderId
      const deliveryTasks = filterDeliveryTasks(trip.tasks)

      const trackingURLs = await this.getTrackingURLs(workflowOrderId, deliveryTasks)

      const couriers = R.path(['optimized', 'couriers'], metadata)
      const companyName = this.getCompanyName(companyId, couriers)
      const workflowInput: IWorkFlowTransport = {
        userId,
        staffId,
        orderId,
        orderReferenceId,
        companyId,
        projectId,
        companyName,
        trackingURLs,
        // remove when production workflow support new input
        tripId,
        trip: {
          _id: tripId,
          windowTime,
          metadata: trip.metadata,
        },
      }
      this.startTransportWorkflow(todo, workflowInput)

      logger.info({ ...responseTime(logMetadata), staffId }, _acceptTrip)
      return transformTodoResponse({ taskTypeCode, todoTypeCode, todo: _todo })
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) }, _acceptTrip)

      if (err instanceof ValidateError) throw err

      if (holdWithdrawal) {
        const weomniTxRef = R.path(['txRef'], holdWithdrawal)
        try {
          await this.creditWalletAcceptDomain.releaseHoldWithdrawal(userId, tripId, weomniTxRef)
        } catch (release_err) {
          logger.error({
            err: release_err,
            ...responseTime(logMetadata),
            action: 'process_release_hold_withdrawal',
            weomniTxRef,
          })
        }
      }

      await Promise.all([
        this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate }),
        this.TaskRepository.updateStatus(taskId, taskStatusBeforeUpdate),
        this.TripRepository.updateStatus({ tasks: { $in: [taskId] } }, tripStatusBeforeUpdate),
        updateMetadata(tripId, { weomniTxRef: '', ...metadata }),
      ])

      throw err
    }
  }
}
