import { TaskTypeDispatcher } from './taskTypeDispatcher'
import { type ITodoRepo } from '../../models/implementations/todoRepo'
import { type IAcceptTrip } from './acceptTrip'
import { type IPickup } from './pickUp'
import { type IDelivery } from './delivery'
import { type IReturn } from './return'
import { ValidateError, CreditWalletFailed } from '../../constants/error'
import { type IFleetApiService } from '../../adapters/restClient/fleet'

const TodoRepo: ITodoRepo = {
  getTodo: jest.fn(),
}

const AcceptTrip: IAcceptTrip = {
  process: jest.fn(),
}

const Pickup: IPickup = {
  process: jest.fn(),
}

const Delivery: IDelivery = {
  process: jest.fn(),
}

const Return: IReturn = {
  process: jest.fn(),
}

const FleetApiService: IFleetApiService = {
  getStaffsOrderTicket: jest.fn(),
}

describe('Task type dispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should dispatch to task type Accept trip', async () => {
    const taskTypeDispatcher = new TaskTypeDispatcher(
      TodoRepo,
      AcceptTrip,
      Pickup,
      Delivery,
      Return,
      FleetApiService,
    )

    TodoRepo.getTodo.mockResolvedValue({
      taskId: {
        _id: 'task_id',
        taskTypeId: {
          code: 'ACCEPT_TRIP',
        },
        tripId: {
          _id: 'trip_id',
          orderId: 'order_id',
          orderReferenceId: 'order_ref_id',
        },
      },
    })

    FleetApiService.getStaffsOrderTicket.mockResolvedValue({
      total: 1,
    })

    await taskTypeDispatcher.dispatch('todoId_111', { userId: 'userId_111' })

    expect(AcceptTrip.process).toHaveBeenCalled()
  })

  it('Should dispatch to task type Pickup', async () => {
    const taskTypeDispatcher = new TaskTypeDispatcher(
      TodoRepo,
      AcceptTrip,
      Pickup,
      Delivery,
      Return,
      FleetApiService,
    )

    FleetApiService.getStaffsOrderTicket.mockResolvedValue({
      total: 1,
    })

    TodoRepo.getTodo.mockResolvedValue({
      taskId: {
        _id: 'task_id',
        taskTypeId: {
          code: 'PICKUP',
        },
        tripId: {
          _id: 'trip_id',
          orderId: 'order_id',
          orderReferenceId: 'order_ref_id',
        },
      },
    })

    await taskTypeDispatcher.dispatch('todoId_111', { userId: 'userId_111' })

    expect(Pickup.process).toHaveBeenCalled()
  })

  it('Should dispatch to task type Delivery', async () => {
    const taskTypeDispatcher = new TaskTypeDispatcher(
      TodoRepo,
      AcceptTrip,
      Pickup,
      Delivery,
      Return,
      FleetApiService,
    )

    TodoRepo.getTodo.mockResolvedValue({
      taskId: {
        _id: 'task_id',
        taskTypeId: {
          code: 'DELIVERY',
        },
        tripId: {
          _id: 'trip_id',
          orderId: 'order_id',
          orderReferenceId: 'order_ref_id',
        },
      },
    })

    FleetApiService.getStaffsOrderTicket.mockResolvedValue({
      total: 1,
    })

    await taskTypeDispatcher.dispatch('todoId_111', { userId: 'userId_111' })

    expect(Delivery.process).toHaveBeenCalled()
  })

  it('Todo task type code not one of [ACCEPT_TRIP, PICKUP, DELIVERY], Should throw ValidateError,', async () => {
    expect.assertions(1)
    const taskTypeDispatcher = new TaskTypeDispatcher(
      TodoRepo,
      AcceptTrip,
      Pickup,
      Delivery,
      Return,
      FleetApiService,
    )

    TodoRepo.getTodo.mockResolvedValue({
      taskId: {
        _id: 'task_id',
        taskTypeId: {
          code: 'xxxx',
        },
        tripId: {
          _id: 'trip_id',
          orderId: 'order_id',
          orderReferenceId: 'order_ref_id',
        },
      },
    })

    FleetApiService.getStaffsOrderTicket.mockResolvedValue({
      total: 1,
    })

    try {
      await taskTypeDispatcher.dispatch('todoId_111', { userId: 'userId_111' })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })

  it('Not allowed to accept trip, Should throw CreditWalletFailed,', async () => {
    expect.assertions(1)
    const taskTypeDispatcher = new TaskTypeDispatcher(
      TodoRepo,
      AcceptTrip,
      Pickup,
      Delivery,
      Return,
      FleetApiService,
    )

    TodoRepo.getTodo.mockResolvedValue({
      taskId: {
        _id: 'task_id',
        taskTypeId: {
          code: 'ACCEPT_TRIP',
        },
        tripId: {
          _id: 'trip_id',
          orderId: 'order_id',
          orderReferenceId: 'order_ref_id',
        },
      },
    })

    FleetApiService.getStaffsOrderTicket.mockResolvedValue({
      total: 0,
    })

    try {
      await taskTypeDispatcher.dispatch('todoId_111', { userId: 'userId_111' })
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })
})
