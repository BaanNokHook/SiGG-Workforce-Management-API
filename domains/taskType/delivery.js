// @flow
import R from 'ramda'
import { type ITodoRepo, type Todo, type TodoStatus } from '../../models/implementations/todoRepo'
import { type ITaskRepo, type TaskStatus } from '../../models/implementations/taskRepo'
import { type ITripRepo, type TripStatus } from '../../models/implementations/tripRepo'
import {
  transformTodoResponse,
  type TransformTodoResponse,
  TODO_TYPE_ERROR_CODE,
} from './utils/index'
import logger from '../../libraries/logger/index'
import { validateData } from '../../utils/validate'
import { ValidateError } from '../../constants/error'
import {
  type ImagePath,
  type Setoff,
  type CheckIn,
  type TakePhoto,
  type ProofOfDelivery,
  type CollectCash,
  type Delivered,
  type TodoType,
  type UpdateTodoInput,
  type Summary,
  type Receipt,
} from './utils/type'

import { updateTripDetailStatus } from './updateTrip'
import { TRIP_STATUS } from '../../models/trip.repository'
import { TASK_STATUS } from '../../models/task.repository'
import { TODO_STATUS } from '../../models/todo.repository'
import { isAllTaskCompleted } from '../../utils/task.util'
import { getTripStatus } from '../../utils/trip.util'
import { CreditWalletSettlementDomain } from '../weomni/creditWalletSettlement'
import { isUseCreditWallet } from '../../utils/weomni.util'
import responseTime from '../../libraries/logger/responseTime'
import {
  getTodoMobileConfig,
  TodoSummaryItemConfig,
  TodoMobileConfig,
  validateSummaryAttribute,
  pickAttributeOrGetFromTrip,
} from '../../utils/todo.util'

export interface IDelivery {
  process(todo: Todo, input: UpdateTodoInput): Promise<TransformTodoResponse>;
}
export class Delivery implements IDelivery {
  TripRepository: ITripRepo
  TodoRepository: ITodoRepo
  TaskRepository: ITaskRepo
  creditWalletSettlementDomain: CreditWalletSettlementDomain

  constructor(
    TodoRepository: ITodoRepo,
    TaskRepository: ITaskRepo,
    TripRepository: ITripRepo,
    creditWalletSettlementDomain: CreditWalletSettlementDomain,
  ) {
    this.TodoRepository = TodoRepository
    this.TaskRepository = TaskRepository
    this.TripRepository = TripRepository
    this.creditWalletSettlementDomain = creditWalletSettlementDomain
  }

  validateSetOff(todo: Todo) {
    const { status: todoStatus, todoType } = todo
    const { status: taskStatus } = todo.taskId
    const { status: tripStatus } = todo.taskId.tripId

    const isAcceptTrip = tripStatus === 'DOING'
    const isActiveTask = taskStatus === 'PENDING'
    const isActiveTodo = todoStatus === 'TODO'
    const errorCode = TODO_TYPE_ERROR_CODE[todoType.code]

    if (!isAcceptTrip) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTodo`)
    }
  }

  async todoTypeSetOff(todo: Todo, setOff: Setoff) {
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = 'DONE'

    const { _id: taskId } = todo.taskId
    const taskStatusBeforeUpdate: TaskStatus = todo.taskId.status
    const taskStatusRequestUpdate: TaskStatus = 'DOING'

    const { _id: tripId } = todo.taskId.tripId

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
      data: setOff,
    })

    this.validateSetOff(todo)

    try {
      const { lat, lng, date, userId } = setOff
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { lat, lng, date, userId },
          status: todoStatusRequestUpdate,
        }),
        this.TaskRepository.updateStatus(taskId, taskStatusRequestUpdate),
      ])

      await updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo })

      return _todo
    } catch (error) {
      await Promise.all([
        this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate }),
        this.TaskRepository.updateStatus(taskId, taskStatusBeforeUpdate),
      ])

      throw error
    }
  }

  validateTodo(todo: Todo) {
    const { status: todoStatus, todoType } = todo
    const { status: taskStatus } = todo.taskId
    const { status: tripStatus } = todo.taskId.tripId

    const isAcceptTrip = tripStatus === 'DOING'
    const isActiveTask = taskStatus === 'DOING'
    const isActiveTodo = todoStatus === 'TODO'
    const errorCode = TODO_TYPE_ERROR_CODE[todoType.code]

    if (!isAcceptTrip) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `delivery.error.${errorCode}.inactiveTodo`)
    }
  }

  async todoTypeCheckIn(todo: Todo, checkIn: CheckIn) {
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = 'DONE'

    const { _id: tripId } = todo.taskId.tripId

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
      data: checkIn,
    })

    this.validateTodo(todo)

    try {
      const { lat, lng, date, userId } = checkIn
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { lat, lng, date, userId },
          status: todoStatusRequestUpdate,
        }),
        updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo }),
      ])

      return _todo
    } catch (error) {
      await this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate })

      throw error
    }
  }

  async todoTypeReceipt(todo: Todo, receipt: Receipt) {
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = TODO_STATUS.DONE

    const { _id: taskId } = todo.taskId
    const taskStatusBeforeUpdate: TaskStatus = todo.taskId.status
    const taskStatusRequestUpdate: TaskStatus = TASK_STATUS.DONE

    const { _id: tripId } = todo.taskId.tripId
    const tripStatusBeforeUpdate: TripStatus = todo.taskId.status

    validateData({
      schema: {
        properties: {
          method: { type: 'string' },
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
        required: ['date', 'userId', 'lat', 'lng', 'method'],
      },
      data: receipt,
    })

    this.validateTodo(todo)

    try {
      // This is bad, Need to change to something more dynamic
      // rather than just hardcode with todoType
      // Should implement state control and make the condition of
      // Todo, Task, Trip more configurable

      const updateDetailService = {
        'payment.method': receipt.method,
      }

      const [_todo] = await Promise.all([
        this.TripRepository.update(tripId, updateDetailService),
        this.TodoRepository.updateById(todoId, {
          result: { ...receipt },
          status: todoStatusRequestUpdate,
        }),
        // Hard coded update task status
        this.TaskRepository.updateStatus(taskId, taskStatusRequestUpdate),
      ])

      const trip = await this.getTrip(tripId)
      if (isAllTaskCompleted(trip.tasks)) {
        await updateTripDetailStatus({
          TripRepo: this.TripRepository,
          tripId,
          todo,
          tripStatus: getTripStatus(trip.tasks, TRIP_STATUS.DONE),
        })
      } else {
        await updateTripDetailStatus({
          TripRepo: this.TripRepository,
          tripId,
          todo,
          tripStatus: TRIP_STATUS.DOING,
        })
      }

      return _todo
    } catch (error) {
      await Promise.all([
        this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate }),
        this.TaskRepository.updateStatus(taskId, taskStatusBeforeUpdate),
        this.TripRepository.update(tripId, { status: tripStatusBeforeUpdate, deliveredTime: '' }),
      ])
      throw error
    }
  }

  async todoTypeSummary(todo: Todo, summary: Summary) {
    const { _id: todoId, result } = todo
    const { _id: tripId } = todo.taskId.tripId

    validateData({
      schema: {
        properties: {
          item: { type: 'object' },
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
        required: ['date', 'userId', 'lat', 'lng', 'item'],
      },
      data: summary,
    })

    this.validateTodo(todo)

    const trip = await this.getTrip(tripId)
    const todoConfig: TodoMobileConfig = getTodoMobileConfig(trip)

    validateSummaryAttribute(todoConfig.summaryItems, summary.item)

    let updateSummary = pickAttributeOrGetFromTrip(todoConfig.summaryItems, summary.item, trip)

    const updateDetailService = {}
    for (let attr of Object.keys(updateSummary)) {
      updateDetailService[`payment.detailService.${attr}`] = updateSummary[attr]
    }

    try {
      const [_todo] = await Promise.all([
        this.TripRepository.update(tripId, updateDetailService),
        this.TodoRepository.updateById(todoId, {
          result: {
            userId: summary.userId,
            lat: summary.lat,
            lng: summary.lng,
            date: summary.date,
            item: updateSummary,
          },
          status: 'DONE',
        }),
        updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo }),
      ])

      return _todo
    } catch (error) {
      await this.TodoRepository.updateById(todoId, { result, status: 'TODO' })

      throw error
    }
  }

  async todoTypeCollectCash(todo: Todo, collectCash: CollectCash) {
    const { _id: todoId, result } = todo

    const { _id: tripId } = todo.taskId.tripId

    validateData({
      schema: {
        properties: {
          price: { type: 'number' },
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
        required: ['date', 'userId', 'lat', 'lng', 'price'],
      },
      data: collectCash,
    })

    this.validateTodo(todo)

    try {
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { ...collectCash },
          status: 'DONE',
        }),
        updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo }),
      ])

      return _todo
    } catch (error) {
      await this.TodoRepository.updateById(todoId, { result, status: 'TODO' })

      throw error
    }
  }

  getImagePath(urls: string[]): ImagePath {
    const imagePaths = urls.map((imageUrl) => {
      // ex. imageUrl '/DEV_TEST/FjeBVvIe3.jpg'
      const splitWithSlash = imageUrl.split('/')
      const imagePath = R.last(splitWithSlash)
      return imagePath
    })

    return {
      imgUrls: imagePaths,
    }
  }

  async todoTypeTakePhoto(todo: Todo, takePhoto: TakePhoto) {
    /** TODO
     *  - feature change image
     */
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = 'DONE'

    const { _id: tripId } = todo.taskId.tripId

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
          images: {
            type: 'array',
            items: { type: 'string', pattern: '^(?!s*$).+' },
            contains: { type: 'string', pattern: '^(?!s*$).+' },
            errorMessage: 'contains must be an String',
          },
        },
        required: ['date', 'userId', 'lat', 'lng', 'images'],
      },
      data: takePhoto,
    })

    this.validateTodo(todo)

    try {
      const imagePaths = this.getImagePath(takePhoto.images)
      const { date, userId, lat, lng } = takePhoto
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { date, lat, lng, userId, ...imagePaths },
          status: todoStatusRequestUpdate,
        }),
        updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo }),
      ])

      return _todo
    } catch (error) {
      await this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate })

      throw error
    }
  }

  async todoTypeProofOfDelivery(todo: Todo, proofOfDelivery: ProofOfDelivery) {
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = 'DONE'

    const { _id: tripId } = todo.taskId.tripId

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
          images: {
            type: 'array',
            items: { type: 'string', pattern: '^(?!s*$).+' },
            contains: { type: 'string', pattern: '^(?!s*$).+' },
            errorMessage: 'contains must be an String',
          },
          relationship: { type: 'string' },
        },
        required: ['date', 'userId', 'lat', 'lng', 'images'],
      },
      data: proofOfDelivery,
    })

    this.validateTodo(todo)

    try {
      const imagePaths = this.getImagePath(proofOfDelivery.images)
      const { date, userId, lat, lng, recipientName, relationship } = proofOfDelivery
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { date, lat, lng, userId, recipientName, ...imagePaths, relationship },
          status: todoStatusRequestUpdate,
        }),
        updateTripDetailStatus({ TripRepo: this.TripRepository, tripId, todo }),
      ])

      return _todo
    } catch (error) {
      await this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate })

      throw error
    }
  }

  async validateToDelivered(taskId: string, currentTodoId: string): Promise<boolean> {
    const task = await this.TaskRepository.getTaskById(taskId, [
      { path: 'tripId' },
      { path: 'todos' },
    ])

    const { todos, status: taskStatus } = task
    const { status: tripStatus } = task.tripId
    const isActiveTrip = tripStatus === 'DOING'
    const isActiveTask = taskStatus === 'DOING'

    if (!isActiveTrip) {
      throw new ValidateError(null, null, `delivery.error.delivered.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `delivery.error.delivered.inactiveTask`)
    }

    const requiredTodoExcludeCurrentTodoNotDone = todos.find((_todo) => {
      const { status, isRequired, _id } = _todo
      const isCurrentTodo = String(_id) === String(currentTodoId)
      const isRequiredTodoDone = isRequired && status === 'DONE'
      return !isCurrentTodo && !isRequiredTodoDone
    })

    const isRequiredTodoDone = requiredTodoExcludeCurrentTodoNotDone === undefined

    if (!isRequiredTodoDone) {
      throw new ValidateError(`Not allowed to delivered because required todo not done`)
    }

    return isActiveTrip && isActiveTask && isRequiredTodoDone
  }

  getTrip(tripId: string) {
    return this.TripRepository.getTripById(tripId, {
      populate: [
        {
          path: 'tasks',
          populate: [
            {
              path: 'taskTypeId',
            },
          ],
        },
      ],
    })
  }

  async todoTypeDelivered(todo: Todo, delivered: Delivered) {
    const { _id: todoId, result } = todo
    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = TODO_STATUS.DONE

    const { _id: taskId } = todo.taskId
    const taskStatusBeforeUpdate: TaskStatus = todo.taskId.status
    const taskStatusRequestUpdate: TaskStatus = TASK_STATUS.DONE

    const { _id: tripId, metadata } = todo.taskId.tripId
    const tripStatusBeforeUpdate: TripStatus = todo.taskId.status

    let creditWalletSettleResult = {}

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
      data: delivered,
    })

    const { lat, lng, date, userId } = delivered

    const logMetadata = {
      event: 'ondemand_delivery',
      action: 'todo_type_delivered',
      userId,
      tripId,
      taskId,
      todoId,
      logResponseTimeStart: new Date().getTime(),
    }

    await this.validateToDelivered(taskId, todoId)

    try {
      if (isUseCreditWallet(metadata)) {
        creditWalletSettleResult = await this.creditWalletSettlementDomain.settlement(userId, todo)
      }

      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { lat, lng, date, userId, ...creditWalletSettleResult },
          status: todoStatusRequestUpdate,
        }),
        this.TaskRepository.updateStatus(taskId, taskStatusRequestUpdate),
      ])

      const trip = await this.getTrip(tripId)
      if (isAllTaskCompleted(trip.tasks)) {
        await updateTripDetailStatus({
          TripRepo: this.TripRepository,
          tripId,
          todo,
          tripStatus: getTripStatus(trip.tasks, TRIP_STATUS.DONE),
        })
      } else {
        await updateTripDetailStatus({
          TripRepo: this.TripRepository,
          tripId,
          todo,
          tripStatus: TRIP_STATUS.DOING,
        })
      }

      return _todo
    } catch (err) {
      logger.error({ err, ...logMetadata }, delivered)

      await Promise.all([
        this.TodoRepository.updateById(todoId, { status: todoStatusBeforeUpdate }),
        this.TaskRepository.updateStatus(taskId, taskStatusBeforeUpdate),
        this.TripRepository.update(tripId, { status: tripStatusBeforeUpdate, deliveredTime: '' }),
      ])

      throw err
    }
  }

  async process(todo: Todo, input: UpdateTodoInput) {
    const _input = {
      ...input,
      date: new Date(),
    }

    const { userId } = input

    const { _id: todoId } = todo
    const todoType: TodoType = R.path(['todoType', 'code'], todo)

    const { _id: taskId } = todo.taskId
    const taskTypeCode = R.path(['taskTypeId', 'code'], todo.taskId)

    const { _id: tripId, orderId, orderReferenceId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)

    const logMetadata = {
      event: 'task_type_delivery_update_todo',
      userId,
      tripId,
      taskId,
      todoId,
      orderId,
      todoType,
      consignment,
      orderReferenceId,
      taskTypeCode,
      logResponseTimeStart: new Date().getTime(),
    }

    try {
      if (todoType === 'SET_OFF') {
        const todoSetoffUpdated = await this.todoTypeSetOff(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoSetoffUpdated,
        })
      }

      if (todoType === 'CHECK_IN') {
        const todoCheckInUpdated = await this.todoTypeCheckIn(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoCheckInUpdated,
        })
      }

      if (todoType === 'TAKE_A_PHOTO') {
        const todoTaskPhotoUpdated = await this.todoTypeTakePhoto(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoTaskPhotoUpdated,
        })
      }

      if (todoType === 'COLLECT_CASH') {
        const todoCollectCashUpdated = await this.todoTypeCollectCash(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoCollectCashUpdated,
        })
      }

      if (todoType === 'POD') {
        const todoProofOfDeliveryUpdated = await this.todoTypeProofOfDelivery(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoProofOfDeliveryUpdated,
        })
      }

      if (todoType === 'SUMMARY') {
        const todoTypeSummaryUpdated = await this.todoTypeSummary(todo, _input)
        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoTypeSummaryUpdated,
        })
      }

      if (todoType === 'RECEIPT') {
        const todoTypeReceiptUpdated = await this.todoTypeReceipt(todo, _input)
        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoTypeReceiptUpdated,
        })
      }

      if (todoType === 'DELIVERED') {
        const todoDeliveredUpdated = await this.todoTypeDelivered(todo, _input)

        logger.info(responseTime(logMetadata), _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoDeliveredUpdated,
        })
      }

      throw new ValidateError(`Invalid todo type`)
    } catch (err) {
      logger.error({ err, ...logMetadata }, _input)
      throw err
    }
  }
}
