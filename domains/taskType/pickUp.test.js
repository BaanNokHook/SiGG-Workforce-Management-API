// @flow
import { PickUp } from './pickUp'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITodoRepo } from '../../models/implementations/todoRepo'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { todo, todos, task, trip, input, input_picking_items } from './pickUp.mock'
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

describe('Pick up', () => {
  MockDate.set('2021-08-18T14:49:38+07:00')
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('The consumer should be able to call new() on PickUp', () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)
    expect(pickUp).toBeTruthy()
  })

  it('Should update Todo(SET_OFF) status and Task status', async () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

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
            code: 'PICKUP',
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
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

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
          taskTypeId: {
            code: 'PICKUP',
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

  it('Should update Todo(PACKING_ITEMS) status', async () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'PACKING_ITEMS',
          name: 'PACKING ITEMS',
        },
        taskId: {
          ...task,
          information: {
            parcels: input_picking_items.parcels,
          },
          taskTypeId: {
            code: 'PICKUP',
          },
          status: 'DOING',
        },
      },
      input_picking_items,
    )

    expect(TodoRepo.updateById).toHaveBeenCalledWith('todoId_111', {
      result: {
        date: new Date('2021-08-18T14:49:38+07:00'),
        lat: 13.6851301,
        lng: 100.6088319,
        userId: 'userId_111',
        parcels: [
          {
            consignment: '',
            productId: 'SKU00010',
            name: 'Coke 250 ml.',
            type: 'PRODUCTS',
            description: '',
            imageUrl: 'https://www.example.com/image1.jpeg',
            quantity: 20,
            unit: 'ขวด',
            weight: 250,
            dimension: {
              width: 10,
              length: 10,
              height: 10,
            },
            price: 10,
            note: 'ไม่เย็น',
            payment: {
              original: 10,
              actual: 10,
              amount: 10,
            },
          },
        ],
      },
      status: 'DONE',
    })
    expect(TripRepo.update).toHaveBeenCalledWith('tripId_111', {
      detailStatus: 'PICKUP.PACKING_ITEMS.DOING',
      detailStatusMetadata: {
        taskId: undefined,
        taskTypeCode: 'PICKUP',
        todoId: 'todoId_111',
        todoTypeCode: 'PACKING_ITEMS',
        refOrderStatuses: null,
      },
      status: 'DOING',
    })
    expect(result.status).toEqual('DONE')
  })

  it('Should update Todo(TAKE_A_PHOTO) status', async () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

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
          taskTypeId: {
            code: 'PICKUP',
          },
          status: 'DOING',
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
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

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
          taskTypeId: {
            code: 'PICKUP',
          },
          status: 'DOING',
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

  it('Should update Todo(PICKED_UP) status', async () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

    TodoRepo.updateById.mockResolvedValue({
      status: 'DONE',
    })

    TaskRepo.getTaskById.mockResolvedValue({ ...task, status: 'DOING', todos, tripId: trip })

    TaskRepo.updateStatus.mockResolvedValue({
      status: 'DONE',
    })

    TripRepo.update.mockResolvedValue(null)

    const result = await pickUp.process(
      {
        ...todo,
        todoType: {
          code: 'PICKED_UP',
          name: 'PICKED UP',
        },
        taskId: {
          todos,
          status: 'DOING',
          taskTypeId: {
            code: 'PICKUP',
          },
          tripId: trip,
        },
      },
      input,
    )

    expect(TodoRepo.updateById).toHaveBeenCalled()
    expect(TaskRepo.updateStatus).toHaveBeenCalled()
    expect(TripRepo.update).toHaveBeenCalled()
    expect(result.status).toEqual('DONE')
  })
})

describe('Should not pick up', () => {
  MockDate.set('2021-08-18T14:49:38+07:00')
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validate compare parcels, should throw ValidateError', async () => {
    const pickUp = new PickUp(TodoRepo, TaskRepo, TripRepo)

    await expect(
      pickUp.process(
        {
          ...todo,
          todoType: {
            code: 'PACKING_ITEMS',
            name: 'PACKING ITEMS',
          },
          taskId: {
            ...task,
            information: {
              parcels: [
                {
                  type: 'PRODUCTS',
                },
              ],
            },
            taskTypeId: {
              code: 'PICKUP',
            },
            status: 'DOING',
          },
        },
        input_picking_items,
      ),
    ).rejects.toThrow(ValidateError)
  })
})
