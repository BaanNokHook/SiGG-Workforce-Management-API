// @flow
import { TripDomain } from './trip'
import { ITripRepo, type TripStatus } from '../../models/implementations/tripRepo'
import { ITaskRepo, type TaskStatus } from '../../models/implementations/taskRepo'
import { type IWorkflow } from '../../libraries/melonade/melonadeProducer'
import { ValidateError } from '../../constants/error'
import { TASK_STATUS } from '../../models/task.repository'
import { TRIP_STATUS } from '../../models/trip.repository'
import * as generateID from '../../utils/shortId'
import type { IFleetApiService } from '../../adapters/restClient/fleet'
import { ICreditWalletAcceptDomain } from '../weomni/creditWalletAccept'
import config from '../../config'

jest.mock('../trip/updateMetadata')
jest.mock('../../config')

const TripRepo: ITripRepo = {
  update: jest.fn(),
  updateStatus: jest.fn(),
  deleteTrip: jest.fn(),
  createTrip: jest.fn(),
  getTripById: jest.fn(),
  list: jest.fn(),
  getStaffIncome: jest.fn(),
}

const TaskRepo: ITaskRepo = {
  updateStatus: jest.fn(),
  getTaskById: jest.fn(),
  isHasTasks: jest.fn(),
  isRelatedWithTrip: jest.fn(),
  bindTripToTask: jest.fn(),
  updateMany: jest.fn(),
  update: jest.fn(),
  updateStatusTasks: jest.fn(),
  updateStatusAndStatusMetadata: jest.fn(),
}

const Workflow: IWorkflow = {
  start: jest.fn(),
  complete: jest.fn(),
  failed: jest.fn(),
}

const FleetApiService: IFleetApiService = {
  getStaff: jest.fn(),
}

const WeomniWallet: IWeomniWallet = {
  release: jest.fn(),
  capture: jest.fn(),
  searchWallet: jest.fn(),
  withdrawal: jest.fn(),
}

const CreditWalletAcceptDomain: ICreditWalletAcceptDomain = {
  getWalletId: jest.fn(),
}

describe('Create Trip', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should create trip', async () => {
    TaskRepo.isHasTasks.mockResolvedValue(true)
    TaskRepo.isRelatedWithTrip.mockResolvedValue(false)
    TripRepo.createTrip.mockResolvedValue({ tripId: 'ODMTR-01' })
    TaskRepo.bindTripToTask.mockResolvedValue(null)

    const tripInput = {
      tripId: 'ODMTR-01',
      tasks: ['ODMTA-01', 'ODMTA-02'],
    }
    const result = await tripDomain.create(tripInput)

    expect(result.tripId).toEqual('ODMTR-01')
    expect(TripRepo.createTrip).toBeCalledWith(tripInput)
    expect(TaskRepo.bindTripToTask).toHaveBeenCalled()
  })

  it('Should throw error ValidateError', async () => {
    TaskRepo.isHasTasks.mockResolvedValue(false)

    const tripInput = {
      tripId: 'ODMTR-01',
      tasks: ['ODMTA-01', 'ODMTA-02'],
    }
    try {
      await tripDomain.create(tripInput)
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })
})

describe('Delete Trip', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should delete trip', async () => {
    TripRepo.deleteTrip.mockResolvedValue({ ok: 1 })
    const result = await tripDomain.delete('1234')
    expect(result).toEqual({ ok: 1 })
  })
})

describe('Remove staff from Trip', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should remove staff from Trip,Tasks', async () => {
    TripRepo.update.mockResolvedValue({ tasks: ['taskId-01', 'taskId-02'] })
    TaskRepo.updateMany.mockResolvedValue(null)

    await tripDomain.removeStaff('1234')
    expect(TripRepo.update).toHaveBeenCalled()
    expect(TaskRepo.updateMany).toHaveBeenCalled()
  })
})

// ***** cancel trip, cancel task ***
const taskTypeAcceptTrip = { code: 'ACCEPT_TRIP' }
const taskTypePickup = { code: 'PICKUP' }
const taskTypeDelivery = { code: 'DELIVERY' }

/**
 * @param tripStatus  trip status
 * @param taskStatuses  array of [taskAcceptTrip, taskPickup, taskDelivery, taskDelivery] task status
 */
function buildMockTripData(tripStatus: TripStatus, taskStatuses: TaskStatus[]) {
  return {
    _id: 'mongo_tripId',
    staffs: ['mongo_staff_id_1'],
    orderReferenceId: 'orderReferenceId',
    tripId: 'ODMTR_1',
    status: tripStatus,
    orderId: 'orderId_1',
    tasks: [
      {
        _id: 'task_accept_trip',
        taskId: 'taskId_accept_trip',
        status: taskStatuses[0],
        taskTypeId: taskTypeAcceptTrip,
      },
      {
        _id: 'task_pickup',
        taskId: 'taskId_pickup',
        status: taskStatuses[1],
        taskTypeId: taskTypePickup,
        information: {
          parcels: [{ refOrderId: 'ODM_1' }, { refOrderId: 'ODM_2' }],
        },
      },
      {
        _id: 'task_delivery_1',
        taskId: 'taskId_delivery_1',
        status: taskStatuses[2],
        taskTypeId: taskTypeDelivery,
        information: {
          parcels: [{ refOrderId: 'ODM_1' }],
        },
      },
      {
        _id: 'task_delivery_2',
        taskId: 'taskId_delivery_2',
        status: taskStatuses[3],
        taskTypeId: taskTypeDelivery,
        information: {
          parcels: [{ refOrderId: 'ODM_2' }],
        },
      },
    ],
  }
}

describe('Cancel Trip', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)
  const generateShortUUID = jest.spyOn(generateID, 'generateShortUUID').mockReturnValue('1234')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`Should cancel Trip and update trip status to ${TRIP_STATUS.CANCELLED}`, async () => {
    TripRepo.getTripById
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.DOING, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DOING,
          TASK_STATUS.DOING,
        ]),
      )
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.CANCELLED, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.CANCELLED,
          TASK_STATUS.CANCELLED,
        ]),
      )
    TaskRepo.updateStatusTasks(null)
    TripRepo.update.mockResolvedValue(null)
    Workflow.start.mockResolvedValue(null)

    await tripDomain.cancel({
      tripId: 'mongo_tripId',
      status: TRIP_STATUS.CANCELLED,
      note: 'ลูกค้ายกเลิกรายการ:',
    })

    expect(TaskRepo.updateStatusTasks).toBeCalledWith(
      ['task_delivery_1', 'task_delivery_2'],
      TRIP_STATUS.CANCELLED,
    )
    expect(TripRepo.update).toBeCalledWith('mongo_tripId', {
      status: TRIP_STATUS.CANCELLED,
      detailStatus: TRIP_STATUS.CANCELLED,
      detailStatusMetadata: {
        refOrderStatuses: [
          { refOrderId: 'ODM_1', status: TRIP_STATUS.CANCELLED },
          { refOrderId: 'ODM_2', status: TRIP_STATUS.CANCELLED },
        ],
      },
      note: 'ลูกค้ายกเลิกรายการ:',
    })
    expect(Workflow.start).toBeCalledWith(
      `orderReferenceId_${generateShortUUID()}_${TRIP_STATUS.CANCELLED}`,
      {
        name: 'ODM_CANCEL_FAIL_REJECT_TRIP',
        rev: '1',
      },
      {
        note: 'ลูกค้ายกเลิกรายการ:',
        status: 'CANCELLED',
        task: undefined,
        trip: {
          orderId: 'orderId_1',
          orderReferenceId: 'orderReferenceId',
          staffs: ['mongo_staff_id_1'],
          tripId: 'ODMTR_1',
        },
        tripId: 'mongo_tripId',
      },
    )
  })

  it(`Some task delivered,Should cancel Trip and update trip status to ${TRIP_STATUS.PARTIAL_DONE}`, async () => {
    TripRepo.getTripById
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.DOING, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DOING,
        ]),
      )
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.PARTIAL_DONE, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.CANCELLED,
        ]),
      )
    TaskRepo.updateStatusTasks(null)
    TripRepo.update.mockResolvedValue(null)
    Workflow.start.mockResolvedValue(null)

    await tripDomain.cancel({
      tripId: 'mongo_tripId',
      status: TRIP_STATUS.CANCELLED,
      note: 'ลูกค้ายกเลิกรายการ:',
    })

    expect(TaskRepo.updateStatusTasks).toBeCalledWith(['task_delivery_2'], TRIP_STATUS.CANCELLED)
    expect(TripRepo.update).toBeCalledWith('mongo_tripId', {
      detailStatus: TRIP_STATUS.PARTIAL_DONE,
      detailStatusMetadata: {
        refOrderStatuses: [
          { refOrderId: 'ODM_1', status: TRIP_STATUS.DONE },
          { refOrderId: 'ODM_2', status: TRIP_STATUS.CANCELLED },
        ],
      },
      note: 'ลูกค้ายกเลิกรายการ:',
      status: TRIP_STATUS.PARTIAL_DONE,
    })
    expect(Workflow.start).toBeCalledWith(
      `orderReferenceId_${generateShortUUID()}_${TRIP_STATUS.CANCELLED}`,
      {
        name: 'ODM_CANCEL_FAIL_REJECT_TRIP',
        rev: '1',
      },
      {
        note: 'ลูกค้ายกเลิกรายการ:',
        status: 'CANCELLED',
        task: undefined,
        trip: {
          orderId: 'orderId_1',
          orderReferenceId: 'orderReferenceId',
          staffs: ['mongo_staff_id_1'],
          tripId: 'ODMTR_1',
        },
        tripId: 'mongo_tripId',
      },
    )
  })

  it(`Should throw ValidateError when cancel completed trip `, async () => {
    TripRepo.getTripById.mockReturnValueOnce(
      buildMockTripData(TRIP_STATUS.DONE, [
        TASK_STATUS.DONE,
        TASK_STATUS.DONE,
        TASK_STATUS.DONE,
        TASK_STATUS.DONE,
      ]),
    )

    try {
      await tripDomain.cancel({
        tripId: 'mongo_tripId',
        status: TRIP_STATUS.CANCELLED,
        note: 'ลูกค้ายกเลิกรายการ:',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })
})

describe('Cancel Task', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)
  const generateShortUUID = jest.spyOn(generateID, 'generateShortUUID').mockReturnValue('1234')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`Should cancel Task and update Task status to ${TRIP_STATUS.CANCELLED}`, async () => {
    TripRepo.getTripById
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.DOING, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DOING,
          TASK_STATUS.DOING,
        ]),
      )
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.DOING, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.CANCELLED,
          TASK_STATUS.DOING,
        ]),
      )
    TaskRepo.updateStatusAndStatusMetadata.mockResolvedValue(null)
    TripRepo.update.mockResolvedValue(null)
    Workflow.start.mockResolvedValue(null)

    await tripDomain.cancel({
      tripId: 'mongo_tripId',
      taskId: 'taskId_delivery_1',
      status: TRIP_STATUS.CANCELLED,
      reason: 'ลูกค้ายกเลิกรายการ',
      note: 'ทำรายการซ้ำ',
    })

    expect(TaskRepo.updateStatusAndStatusMetadata).toBeCalledWith(
      'taskId_delivery_1',
      'mongo_tripId',
      'CANCELLED',
      { note: 'ทำรายการซ้ำ', reason: 'ลูกค้ายกเลิกรายการ' },
    )
    expect(TripRepo.update).toBeCalledWith('mongo_tripId', {
      detailStatusMetadata: {
        refOrderStatuses: [{ refOrderId: 'ODM_1', status: 'CANCELLED' }],
        taskId: 'taskId_delivery_1',
        taskTypeCode: 'DELIVERY',
      },
    })
    expect(Workflow.start).toBeCalledWith(
      `orderReferenceId_${generateShortUUID()}_${TRIP_STATUS.CANCELLED}`,
      {
        name: 'ODM_CANCEL_FAIL_REJECT_TASK',
        rev: '1',
      },
      {
        note: 'ทำรายการซ้ำ',
        reason: 'ลูกค้ายกเลิกรายการ',
        status: 'CANCELLED',
        task: { _id: 'task_delivery_1', taskId: 'taskId_delivery_1' },
        taskId: 'taskId_delivery_1',
        trip: {
          orderId: 'orderId_1',
          orderReferenceId: 'orderReferenceId',
          staffs: ['mongo_staff_id_1'],
          tripId: 'ODMTR_1',
        },
        tripId: 'mongo_tripId',
      },
    )
  })

  it(`Cancel Task last Task, should cancel Trip and update Trip Status to ${TRIP_STATUS.CANCELLED}`, async () => {
    TripRepo.getTripById
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.DOING, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DOING,
        ]),
      )
      .mockReturnValueOnce(
        buildMockTripData(TRIP_STATUS.PARTIAL_DONE, [
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.DONE,
          TASK_STATUS.CANCELLED,
        ]),
      )
    TaskRepo.updateStatusAndStatusMetadata.mockResolvedValue(null)
    TripRepo.update.mockResolvedValue(null)
    Workflow.start.mockResolvedValue(null)

    await tripDomain.cancel({
      tripId: 'mongo_tripId',
      taskId: 'taskId_delivery_2',
      status: TRIP_STATUS.CANCELLED,
      reason: 'ลูกค้ายกเลิกรายการ',
      note: 'ทำรายการซ้ำ',
    })

    expect(TaskRepo.updateStatusAndStatusMetadata).toBeCalledWith(
      'taskId_delivery_2',
      'mongo_tripId',
      'CANCELLED',
      { note: 'ทำรายการซ้ำ', reason: 'ลูกค้ายกเลิกรายการ' },
    )
    expect(TripRepo.update).toBeCalledWith('mongo_tripId', {
      detailStatus: 'PARTIAL_DONE',
      detailStatusMetadata: {
        refOrderStatuses: [
          { refOrderId: 'ODM_1', status: 'DONE' },
          { refOrderId: 'ODM_2', status: 'CANCELLED' },
        ],
      },
      status: 'PARTIAL_DONE',
    })
    expect(Workflow.start).toBeCalledWith(
      `orderReferenceId_${generateShortUUID()}_${TRIP_STATUS.CANCELLED}`,
      {
        name: 'ODM_CANCEL_FAIL_REJECT_TRIP',
        rev: '1',
      },
      {
        note: 'ทำรายการซ้ำ',
        reason: 'ลูกค้ายกเลิกรายการ',
        status: 'CANCELLED',
        task: { _id: 'task_delivery_2', taskId: 'taskId_delivery_2' },
        taskId: 'taskId_delivery_2',
        trip: {
          orderId: 'orderId_1',
          orderReferenceId: 'orderReferenceId',
          staffs: ['mongo_staff_id_1'],
          tripId: 'ODMTR_1',
        },
        tripId: 'mongo_tripId',
      },
    )
  })

  it(`Should throw ValidateError when cancel task completed trip`, async () => {
    TripRepo.getTripById.mockReturnValueOnce(
      buildMockTripData(TRIP_STATUS.DONE, [
        TASK_STATUS.DONE,
        TASK_STATUS.DONE,
        TASK_STATUS.DONE,
        TASK_STATUS.DOING,
      ]),
    )

    try {
      await tripDomain.cancel({
        tripId: 'mongo_tripId',
        taskId: 'task_delivery_1',
        status: TRIP_STATUS.CANCELLED,
        note: 'ลูกค้ายกเลิกรายการ:',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })
})

describe('Trip Active List', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get trip active list correctly ', async () => {
    TripRepo.list.mockReturnValue({
      data: [{ _id: 'tripId01' }, { _id: 'tripId02' }],
      total: 2,
      limit: 100,
      page: 1,
      hasNext: false,
    })

    const result = await tripDomain.tripActiveList('staffId01')

    expect(TripRepo.list).toBeCalledWith(
      { staffs: { $in: ['staffId01'] }, status: 'DOING' },
      {
        limit: 100,
        page: 1,
        populate: [
          {
            path: 'tasks',
            populate: [
              { path: 'geographyId' },
              { path: 'taskTypeId', populate: { path: 'taskTypeGroup' } },
            ],
          },
          { path: 'directions.geographyId' },
        ],
      },
    )
    expect(result).toEqual({
      data: [{ _id: 'tripId01' }, { _id: 'tripId02' }],
      hasNext: false,
      limit: 100,
      page: 1,
      total: 2,
    })
  })

  it('should throw error when get trip active list whit empty staffId', async () => {
    await expect(tripDomain.tripActiveList('')).rejects.toThrow(ValidateError)
  })
})

describe('Calculate Staff Income', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get staff income correctly ', async () => {
    TripRepo.getStaffIncome.mockReturnValueOnce([ { _id: [ '60dc0890491f3700241dd2e0' ], total: 168 } ])
    FleetApiService.getStaff.mockResolvedValue({ type: 'part_time_employee' })
    const result = await tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0', '2021-08-11 00:00:00', '2021-08-11 23:59:59')
    expect(result).toEqual({"total": 168})
  })

  it('should throw error when get staff income whit empty staffId', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('')).rejects.toThrow(ValidateError)
  })

  it('should throw error when get staff income whit empty startAt', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0')).rejects.toThrow(ValidateError)
  })

  it('should throw error when get staff income whit empty endAt', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0', '2021-08-11 00:00:00')).rejects.toThrow(ValidateError)
  })

  it('should throw error when get staff income whit invalid startAt', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0', '2021-08-11', '2021-08-11 00:00:00')).rejects.toThrow(ValidateError)
  })

  it('should throw error when get staff income whit invalid endAt', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0', '2021-08-11 00:00:00', '2021-08-11')).rejects.toThrow(ValidateError)
  })

  it('should throw error when get staff income whit invalid startAt and endAt', async () => {
    await expect(tripDomain.calculatePartTimeEmployeeIncome('60dc0890491f3700241dd2e0', '2021-08-12 00:00:00', '2021-08-11 00:00:00')).rejects.toThrow(ValidateError)
  })
})

describe('Release Credit Wallet By TripID', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('release credit wallet success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.release.mockResolvedValue(true)
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'release',
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(WeomniWallet.release).toBeCalledWith({
      txRef: '21LOTUS-AA1344-7f0d4da9-release',
      amount: '168',
      holdTxRef: '21LOTUS-AA1344-7f0d4da9',
    })
    expect(result).toEqual(true)
  })

  it('release credit wallet with amount success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.release.mockResolvedValue(true)
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'release',
      amount: 100,
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(WeomniWallet.release).toBeCalledWith({
      txRef: '21LOTUS-AA1344-7f0d4da9-release',
      amount: '100',
      holdTxRef: '21LOTUS-AA1344-7f0d4da9',
    })
    expect(result).toEqual(true)
  })

  it('should throw error when trip empty weomniTxRef', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '711cb2417b4fad0011f4f920',
      payment: { detailService: { driver: { holdWallet: 168 } } },
    })
    await expect(
      tripDomain.actionCreditWallet('711cb2417b4fad0011f4f920', { action: 'release' }),
    ).rejects.toThrow(ValidateError)
    expect(TripRepo.getTripById).toBeCalledWith('711cb2417b4fad0011f4f920')
  })

  it('should throw error when trip empty holdWallet', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '811cb2417b4fad0011f4f920',
      metadata: { weomniTxRef: '21LOTUS-AA1344-7f0d4da9' },
    })
    await expect(
      tripDomain.actionCreditWallet('811cb2417b4fad0011f4f920', { action: 'release' }),
    ).rejects.toThrow(ValidateError)
    expect(TripRepo.getTripById).toBeCalledWith('811cb2417b4fad0011f4f920')
  })

  it('should throw error when invalid amount', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    await expect(
      tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
        action: 'release',
        amount: '123',
      }),
    ).rejects.toThrow(ValidateError)
  })
})

describe('Capture Credit Wallet By TripID', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('capture credit wallet success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.capture.mockResolvedValue(true)
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'capture',
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(WeomniWallet.capture).toBeCalledWith({
      txRef: '21LOTUS-AA1344-7f0d4da9-capture',
      amount: '168',
      holdTxRef: '21LOTUS-AA1344-7f0d4da9',
    })
    expect(result).toEqual(true)
  })

  it('capture credit wallet with amount success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.capture.mockResolvedValue(true)
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'capture',
      amount: 100,
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(WeomniWallet.capture).toBeCalledWith({
      txRef: '21LOTUS-AA1344-7f0d4da9-capture',
      amount: '100',
      holdTxRef: '21LOTUS-AA1344-7f0d4da9',
    })
    expect(result).toEqual(true)
  })

  it('should throw error when trip empty weomniTxRef', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '711cb2417b4fad0011f4f920',
      payment: { detailService: { driver: { holdWallet: 168 } } },
    })
    await expect(
      tripDomain.actionCreditWallet('711cb2417b4fad0011f4f920', { action: 'capture' }),
    ).rejects.toThrow(ValidateError)
    expect(TripRepo.getTripById).toBeCalledWith('711cb2417b4fad0011f4f920')
  })

  it('should throw error when trip empty holdWallet', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '811cb2417b4fad0011f4f920',
      metadata: { weomniTxRef: '21LOTUS-AA1344-7f0d4da9' },
    })
    await expect(
      tripDomain.actionCreditWallet('811cb2417b4fad0011f4f920', { action: 'capture' }),
    ).rejects.toThrow(ValidateError)
    expect(TripRepo.getTripById).toBeCalledWith('811cb2417b4fad0011f4f920')
  })

  it('should throw error when invalid amount', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    await expect(
      tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
        action: 'capture',
        amount: '123',
      }),
    ).rejects.toThrow(ValidateError)
  })
})

describe('Withdraw Credit Wallet By TripID', () => {
  const tripDomain = new TripDomain(TripRepo, TaskRepo, Workflow, FleetApiService, WeomniWallet, CreditWalletAcceptDomain)
  const generateShortUUID = jest.spyOn(generateID, 'generateShortUUID').mockReturnValue('1234')
  config.weomni.wallet.sendit.id = 95758

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('withdraw credit wallet success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.withdrawal.mockResolvedValue(true)
    FleetApiService.getStaff.mockResolvedValue({ userId: 'userId_111' })
    CreditWalletAcceptDomain.getWalletId.mockResolvedValue(1234 )
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'withdraw',
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(FleetApiService.getStaff).toHaveBeenCalledWith('staffId_111')
    expect(WeomniWallet.withdrawal).toBeCalledWith({
      from: 1234,
      tags: ['Lotus', 'store'],
      to: 95758,
      txRef: `21LOTUS-AA2765-${generateShortUUID()}`,
      amount: '168',
    })
    expect(result).toEqual(true)
  })

  it('withdraw credit wallet with amount success', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    WeomniWallet.withdrawal.mockResolvedValue(true)
    FleetApiService.getStaff.mockResolvedValue({ userId: 'userId_111' })
    CreditWalletAcceptDomain.getWalletId.mockResolvedValue(1234 )
    const result = await tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
      action: 'withdraw',
      amount: 100,
    })
    expect(TripRepo.getTripById).toBeCalledWith('611cb2417b4fad0011f4f920')
    expect(FleetApiService.getStaff).toHaveBeenCalledWith('staffId_111')
    expect(WeomniWallet.withdrawal).toBeCalledWith({
      from: 1234,
      tags: ['Lotus', 'store'],
      to: 95758,
      txRef: `21LOTUS-AA2765-${generateShortUUID()}`,
      amount: '100',
    })
    expect(result).toEqual(true)
  })

  it('should throw error when trip empty weomniTxRef', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '711cb2417b4fad0011f4f920',
      payment: { detailService: { driver: { holdWallet: 168 } } },
      staffs: ['staffId_111'],
    })
    FleetApiService.getStaff.mockResolvedValue({ userId: 'userId_111' })
    CreditWalletAcceptDomain.getWalletId.mockResolvedValue(1234 )
    await expect(
      tripDomain.actionCreditWallet('711cb2417b4fad0011f4f920', { action: 'withdraw' }),
    ).rejects.toThrow(ValidateError)
    expect(FleetApiService.getStaff).toHaveBeenCalledWith('staffId_111')
    expect(TripRepo.getTripById).toBeCalledWith('711cb2417b4fad0011f4f920')
  })

  it('should throw error when trip empty holdWallet', async () => {
    TripRepo.getTripById.mockReturnValue({
      _id: '811cb2417b4fad0011f4f920',
      metadata: { weomniTxRef: '21LOTUS-AA1344-7f0d4da9' },
      staffs: ['staffId_111'],
    })
    FleetApiService.getStaff.mockResolvedValue({ userId: 'userId_111' })
    CreditWalletAcceptDomain.getWalletId.mockResolvedValue(1234 )
    await expect(
      tripDomain.actionCreditWallet('811cb2417b4fad0011f4f920', { action: 'withdraw' }),
    ).rejects.toThrow(ValidateError)
    expect(FleetApiService.getStaff).toHaveBeenCalledWith('staffId_111')
    expect(TripRepo.getTripById).toBeCalledWith('811cb2417b4fad0011f4f920')
  })

  it('should throw error when invalid amount', async () => {
    TripRepo.getTripById.mockReturnValue(buildMockGetTripByIdData())
    await expect(
      tripDomain.actionCreditWallet('611cb2417b4fad0011f4f920', {
        action: 'withdraw',
        amount: '123',
      }),
    ).rejects.toThrow(ValidateError)
  })
})

function buildMockGetTripByIdData() {
  return {
    _id: '611cb2417b4fad0011f4f920',
    metadata: {
      weomniTxRef: '21LOTUS-AA1344-7f0d4da9',
      consumerName: 'Lotus',
      orderId: '21LOTUS-AA2765',
      storeName: 'store',
      transactionId: '123',
    },
    payment: {
      detailService: {
        driver: {
          holdWallet: 168,
        },
      },
    },
    staffs: ['staffId_111'],
  }
}