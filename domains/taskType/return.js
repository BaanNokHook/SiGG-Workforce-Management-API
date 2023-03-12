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
  type Setoff,
  type CheckIn,
  type TodoType,
  type UpdateTodoInput,
} from './utils/type'
import { updateTripDetailStatus } from './updateTrip'

export interface IReturn {
  process(todo: Todo, input: UpdateTodoInput): Promise<TransformTodoResponse>;
}

export class Return implements IReturn {
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
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTodo`)
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
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTrip`)
    }

    if (!isActiveTask) {
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTask`)
    }

    if (!isActiveTodo) {
      throw new ValidateError(null, null, `return.error.${errorCode}.inactiveTodo`)
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
      event: 'task_type_return_update_todo',
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

      throw new ValidateError(`Invalid todo type`)
    } catch (err) {
      logger.error({ err, ...logMetadata }, _input)
      throw err
    }
  }
}
