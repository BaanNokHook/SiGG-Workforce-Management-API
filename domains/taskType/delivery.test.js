import { Delivery } from './delivery'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITodoRepo } from '../../models/implementations/todoRepo'
import { TRIP_STATUS } from '../../models/trip.repository'
import { todo, todos, task, trip, input, tripCredit } from './delivery.mock'

const TripRepo: ITripRepo = {
  update: jest.fn(),
  getTripById: jest.fn(),
}

const TaskRepo: ITaskRepo = {
  updateStatus: jest.fn(),
  getTaskById: jest.fn(),
}

const TodoRepo: ITodoRepo = {
  updateById: jest.fn(),
  updateStatus: jest.fn(),
}

const CreditWalletSettlementDomain = {
  settlement: jest.fn(),
}

describe('Delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('The consumer should be able to call new() on Delivery', () => {
    const delivery = new Delivery(TodoRepo, TaskRepo, TripRepo, CreditWalletSettlementDomain)
    expect(delivery).toBeTruthy()
  })

  it('Should update Todo(SET_OFF) status and Task status', async () => {
    const pickUp = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'DELIVERY',
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
    const pickUp = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'CHECK_IN',
          name: 'CHECK IN',
        },
        taskId: {
          ...task,
          status: 'DOING',
          taskTypeId: {
            code: 'DELIVERY',
          },
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })

  it('Should update Todo(TAKE_A_PHOTO) status', async () => {
    const pickUp = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'TAKE_A_PHOTO',
          name: 'TAKE PHOTO',
        },
        taskId: {
          ...task,
          status: 'DOING',
          taskTypeId: {
            code: 'DELIVERY',
          },
        },
      },
      {
        ...input,
        images: ['image1'],
      },
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })

  it('Should update Todo(POD) status', async () => {
    const pickUp = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'POD',
          name: 'SIGN SIGNAL',
        },
        taskId: {
          ...task,
          status: 'DOING',
          taskTypeId: {
            code: 'DELIVERY',
          },
        },
      },
      {
        ...input,
        images: ['image1'],
      },
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })

  it(`Should update trip status to ${TRIP_STATUS.DONE}`, async () => {
    const delivery = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.getTaskById.mockResolvedValue({ ...task, status: 'DOING', todos, tripId: trip })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.getTripById.mockResolvedValue({
      tasks: [
        {
          _id: 'task_id',
          status: 'DONE',
          taskTypeId: { code: 'DELIVERY' },
        },
      ],
    })

    TripRepo.update.mockResolvedValue(null)

    const mockDate = new Date()
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

    const result = await delivery.process(
      {
        ...todo,
        todoType: { code: 'DELIVERED' },
        taskId: {
          todos,
          status: 'DOING',
          taskId: 'taskId_1',
          tripId: trip,
          taskTypeId: { code: 'DELIVERY' },
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TaskRepo.updateStatus).toHaveBeenCalled()
    expect(TripRepo.update).toBeCalledWith('tripId_111', {
      deliveredTime: mockDate,
      detailStatus: 'DELIVERY.DELIVERED.DONE',
      detailStatusMetadata: {
        refOrderStatuses: null,
        taskId: 'taskId_1',
        taskTypeCode: 'DELIVERY',
        todoId: 'todoId_111',
        todoTypeCode: 'DELIVERED',
      },
      status: 'DONE',
    })
    expect(result.status).toEqual('DONE')
  })

  it(`Should update trip status to ${TRIP_STATUS.PARTIAL_DONE}`, async () => {
    const delivery = new Delivery(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.getTaskById.mockResolvedValue({ ...task, status: 'DOING', todos, tripId: trip })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.getTripById.mockResolvedValue({
      tasks: [
        {
          _id: 'task_1',
          status: 'FAILED',
          taskTypeId: { code: 'DELIVERY' },
        },
        {
          _id: 'task_2',
          status: 'DONE',
          taskTypeId: { code: 'DELIVERY' },
        },
      ],
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await delivery.process(
      {
        ...todo,
        todoType: { code: 'DELIVERED' },
        taskId: {
          todos,
          status: 'DOING',
          tripId: trip,
          taskId: 'taskId_1',
          taskTypeId: { code: 'DELIVERY' },
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TaskRepo.updateStatus).toHaveBeenCalled()
    expect(TripRepo.update).toBeCalledWith('tripId_111', {
      detailStatus: 'DELIVERY.DELIVERED.PARTIAL_DONE',
      detailStatusMetadata: {
        refOrderStatuses: null,
        taskId: 'taskId_1',
        taskTypeCode: 'DELIVERY',
        todoId: 'todoId_111',
        todoTypeCode: 'DELIVERED',
      },
      status: 'PARTIAL_DONE',
    })
    expect(result.status).toEqual('DONE')
  })

  it(`Should call creditWalletSettlement success`, async () => {
    const delivery = new Delivery(TodoRepo, TaskRepo, TripRepo, CreditWalletSettlementDomain)

    CreditWalletSettlementDomain.settlement.mockResolvedValue({
      statusCode: 200,
      statusText: 'OK',
    })

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.getTaskById.mockResolvedValue({ ...task, status: 'DOING', todos, tripId: trip })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.getTripById.mockResolvedValue({
      tasks: [
        {
          _id: 'task_1',
          status: 'FAILED',
          taskTypeId: { code: 'DELIVERY' },
        },
        {
          _id: 'task_2',
          status: 'DONE',
          taskTypeId: { code: 'DELIVERY' },
        },
      ],
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await delivery.process(
      {
        ...todo,
        todoType: { code: 'DELIVERED' },
        taskId: {
          todos,
          status: 'DOING',
          tripId: tripCredit,
          taskId: 'taskId_1',
          taskTypeId: { code: 'DELIVERY' },
        },
      },
      input,
    )

    expect(CreditWalletSettlementDomain.settlement).toBeCalledWith('userId_111', {
      ...todo,
      todoType: { code: 'DELIVERED' },
      taskId: {
        todos,
        status: 'DOING',
        tripId: tripCredit,
        taskId: 'taskId_1',
        taskTypeId: { code: 'DELIVERY' },
      },
    })
    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TaskRepo.updateStatus).toHaveBeenCalled()
    expect(TripRepo.update).toBeCalledWith('tripId_111', {
      detailStatus: 'DELIVERY.DELIVERED.PARTIAL_DONE',
      detailStatusMetadata: {
        refOrderStatuses: null,
        taskId: 'taskId_1',
        taskTypeCode: 'DELIVERY',
        todoId: 'todoId_111',
        todoTypeCode: 'DELIVERED',
      },
      status: 'PARTIAL_DONE',
    })
    expect(result.status).toEqual('DONE')
  })

  it(`Should call creditWalletSettlement failed`, async () => {
    const delivery = new Delivery(TodoRepo, TaskRepo, TripRepo, CreditWalletSettlementDomain)

    CreditWalletSettlementDomain.settlement.mockRejectedValue(new Error('invalid token'))

    TaskRepo.getTaskById.mockResolvedValue({ ...task, status: 'DOING', todos, tripId: trip })

    await expect(
      delivery.process(
        {
          ...todo,
          todoType: { code: 'DELIVERED' },
          taskId: {
            _id: 'task_1',
            todos,
            status: 'DOING',
            tripId: tripCredit,
            taskId: 'taskId_1',
            taskTypeId: { code: 'DELIVERY' },
          },
        },
        input,
      ),
    ).rejects.toThrow('invalid token')

    expect(TaskRepo.updateStatus).toBeCalledWith('task_1', 'DOING')
    expect(TripRepo.update).toBeCalledWith('tripId_111', { status: 'DOING', deliveredTime: '' })

    expect(CreditWalletSettlementDomain.settlement).toBeCalledWith('userId_111', {
      ...todo,
      todoType: { code: 'DELIVERED' },
      taskId: {
        _id: 'task_1',
        todos,
        status: 'DOING',
        tripId: tripCredit,
        taskId: 'taskId_1',
        taskTypeId: { code: 'DELIVERY' },
      },
    })
  })
})
