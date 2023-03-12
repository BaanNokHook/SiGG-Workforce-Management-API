// @flow
import { Return } from './return'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITodoRepo } from '../../models/implementations/todoRepo'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { todo, todos, task, trip, input } from './return.mock'
import MockDate from 'mockdate'
import { ValidateError } from '../../constants/error'

const TripRepo: ITripRepo = {
  update: jest.fn(),
}

const TaskRepo: ITaskRepo = {
  updateStatus: jest.fn(),
  getTaskById: jest.fn(),
}

const TodoRepo: ITodoRepo = {
  updateById: jest.fn(),
  updateStatus: jest.fn(),
}

describe('Return', () => {
  MockDate.set('2021-08-18T14:49:38+07:00')
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('The consumer should be able to call new() on Return', () => {
    const deliveryReturn = new Return(TodoRepo, TaskRepo, TripRepo)
    expect(deliveryReturn).toBeTruthy()
  })

  it('Should update Todo(SET_OFF) status and Task status', async () => {
    const deliveryReturn = new Return(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await deliveryReturn.process(
      {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'RETURN',
          },
          status: 'PENDING',
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TaskRepo.updateStatus).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })

  it('Should update Todo(CHECK_IN) status', async () => {
    const deliveryReturn = new Return(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await deliveryReturn.process(
      {
        ...todo,
        todoType: {
          code: 'CHECK_IN',
          name: 'CHECK IN',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'RETURN',
          },
          status: 'DOING',
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })
})
