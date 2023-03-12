// @flow
import R from 'ramda'
import { type ITodoRepo, type Todo, type TodoStatus } from '../../models/implementations/todoRepo'
import { type ITaskRepo, type TaskStatus } from '../../models/implementations/taskRepo'
import { type ITripRepo } from '../../models/implementations/tripRepo'
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
  type PackingItems,
  type TakePhoto,
  type ProofOfDelivery,
  type TodoType,
  type PickedUp,
  type UpdateTodoInput,
} from './utils/type'
import { updateTripDetailStatus } from './updateTrip'

export interface IPickup {
  process(todo: Todo, input: UpdateTodoInput): Promise<TransformTodoResponse>;
}

export class PickUp implements IPickup {
  TodoRepository: ITodoRepo
  TaskRepository: ITaskRepo
  TripRepository: ITripRepo

  constructor(TodoRepository: ITodoRepo, TaskRepository: ITaskRepo, TripRepository: ITripRepo) {
    this.TodoRepository = TodoRepository
    this.TaskRepository = TaskRepository
    this.TripRepository = TripRepository
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
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTodo`)
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
        this.TaskRepository.updateStatus(taskId, taskStatusBeforeUpdate),
        this.TodoRepository.updateById(todoId, { result, status: todoStatusBeforeUpdate }),
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
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `pickup.error.${errorCode}.inactiveTodo`)
    }
  }

  validateParcels(todo: Todo, packingItems: PackingItems) {
    const { information, tripId } = todo.taskId
    const { parcels = {} } = packingItems
    const informationParcels = R.path(['parcels'], information).filter(
      (parcel) => parcel.type == 'PRODUCTS',
    )

    const isDifferenceParcels = R.difference(informationParcels, parcels).length > 0

    if (isDifferenceParcels) {
      throw new ValidateError(null, null, 'todo.error.update.parcelsInvalid', {
        orderId: tripId?.metadata?.orderId,
      })
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

  async todoTypePackingItems(todo: Todo, packingItems: PackingItems) {
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
          parcels: {
            type: 'array',
          },
        },
        required: ['date', 'userId', 'lat', 'lng', 'parcels'],
      },
      data: packingItems,
    })

    this.validateTodo(todo)
    this.validateParcels(todo, packingItems)

    try {
      const { lat, lng, date, userId, parcels } = packingItems
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { lat, lng, date, userId, parcels },
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
        },
        required: ['date', 'userId', 'lat', 'lng', 'images'],
      },
      data: proofOfDelivery,
    })

    this.validateTodo(todo)

    try {
      const imagePaths = this.getImagePath(proofOfDelivery.images)
      const { date, userId, lat, lng, recipientName } = proofOfDelivery
      const [_todo] = await Promise.all([
        this.TodoRepository.updateById(todoId, {
          result: { date, lat, lng, userId, ...imagePaths, recipientName },
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

  async validatePickedUp(taskId: string, currentTodoId: string) {
    const task = await this.TaskRepository.getTaskById(taskId, [
      { path: 'tripId' },
      { path: 'todos' },
    ])

    const { todos, status: taskStatus } = task
    const { status: tripStatus } = task.tripId
    const isActiveTrip = tripStatus === 'DOING'
    const isActiveTask = taskStatus === 'DOING'

    if (!isActiveTrip) {
      throw new ValidateError(null, null, 'pickup.error.pickedUp.inactiveTrip')
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, 'pickup.error.pickedUp.inactiveTask')
    }

    const requiredTodoExcludeCurrentTodoNotDone = todos.find((_todo) => {
      const { status, isRequired, _id } = _todo
      const isCurrentTodo = String(_id) === String(currentTodoId)
      const isRequiredTodoDone = isRequired && status === 'DONE'
      return !isCurrentTodo && !isRequiredTodoDone
    })

    const isRequiredTodoDone = requiredTodoExcludeCurrentTodoNotDone === undefined

    if (!isRequiredTodoDone) {
      throw new ValidateError(null, null, 'pickup.error.pickedUp.requiredTodoNotDone')
    }
  }

  async todoTypePickedUp(todo: Todo, pickedUp: PickedUp) {
    const { _id: todoId, result } = todo

    const { _id: taskId } = todo.taskId

    const { _id: tripId } = todo.taskId.tripId

    const todoStatusBeforeUpdate: TodoStatus = todo.status
    const todoStatusRequestUpdate: TodoStatus = 'DONE'

    const taskStatusBeforeUpdate: TaskStatus = todo.taskId.status
    const taskStatusRequestUpdate: TaskStatus = 'DONE'

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
      data: pickedUp,
    })

    await this.validatePickedUp(taskId, todoId)

    try {
      const { lat, lng, date, userId } = pickedUp
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
        this.TripRepository.update(tripId, { pickedUpTime: '' }),
      ])

      throw error
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
    const taskTypeCode = R.path(['taskTypeId', 'code'], todo)

    const { _id: tripId, orderId, orderReferenceId, metadata } = todo.taskId.tripId
    const consignment = R.pathOr('', ['consignment'], metadata)

    const logMetadata = {
      event: 'task_type_pickup_update_todo',
      userId,
      tripId,
      taskId,
      todoId,
      orderId,
      todoType,
      consignment,
      orderReferenceId,
      taskTypeCode,
    }

    try {
      if (todoType === 'SET_OFF') {
        const todoSetoffUpdated = await this.todoTypeSetOff(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoSetoffUpdated,
        })
      }

      if (todoType === 'CHECK_IN') {
        const todoCheckInUpdated = await this.todoTypeCheckIn(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoCheckInUpdated,
        })
      }

      if (todoType === 'PACKING_ITEMS') {
        const todoTaskPackingItemsUpdated = await this.todoTypePackingItems(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoTaskPackingItemsUpdated,
        })
      }

      if (todoType === 'TAKE_A_PHOTO') {
        const todoTaskPhotoUpdated = await this.todoTypeTakePhoto(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoTaskPhotoUpdated,
        })
      }

      if (todoType === 'POD') {
        const todoProofOfDeliveryUpdated = await this.todoTypeProofOfDelivery(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoProofOfDeliveryUpdated,
        })
      }

      if (todoType === 'PICKED_UP') {
        const todoPickedUpUpdated = await this.todoTypePickedUp(todo, _input)

        logger.info(logMetadata, _input)
        return transformTodoResponse({
          taskTypeCode,
          todoTypeCode: todoType,
          todo: todoPickedUpUpdated,
        })
      }

      throw new ValidateError(`Invalid todo type`)
    } catch (err) {
      logger.error({ err, ...logMetadata }, _input)
      throw err
    }
  }
}
