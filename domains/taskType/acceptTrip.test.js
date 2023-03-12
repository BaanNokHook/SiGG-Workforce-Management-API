import MockDate from 'mockdate'
import { AcceptTrip } from './acceptTrip'
import { type ITodoRepo, type TodoStatus } from '../../models/implementations/todoRepo'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { type IWorkflow } from '../../libraries/melonade/melonadeProducer'
import { type IUrlShortenApiService } from '../../adapters/restClient/urlShorten'
import { type IDispatchApiService } from '../../adapters/restClient/dispatch'
import { type IFleetApiService } from '../../adapters/restClient/fleet'
import {
  autoAssignCourierTodo,
  manualAssignCourierTodo,
  input,
  completedTodo,
  inactiveTask,
  inactiveTrip,
} from './acceptTrip.mock'
import { ValidateError } from '../../constants/error'

const TodoRepo: ITodoRepo = {
  updateById: jest.fn(),
  updateStatus: jest.fn(),
}

const TripRepo: ITripRepo = {
  update: jest.fn(),
  updateStatus: jest.fn(),
  getTripById: jest.fn(),
}

const TaskRepo: ITaskRepo = {
  updateStatus: jest.fn(),
  getTaskById: jest.fn(),
}

const Workflow: IWorkflow = {
  start: jest.fn(),
  complete: jest.fn(),
  failed: jest.fn(),
}

const DispatchApiService: IDispatchApiService = {
  updateTicket: jest.fn(),
  getTicket: jest.fn(),
}

const FleetApiService: IFleetApiService = {
  getStaff: jest.fn(),
}

const UrlShortenApiService: IUrlShortenApiService = {
  generateUrl: jest.fn(),
}

const mockGenerateSequenceId = {
  acceptTripReferenceId: jest.fn(),
}

const mockTripDomain = {
  tripActiveList: jest.fn(),
}

const mockHoldWidtdraw = {
  holdWithdrawal: jest.fn(),
}

const mockReleaseWidtdraw = {
  releaseHoldWithdrawal: jest.fn(),
}

describe('Accept trip', () => {
  const todoStatusRequestUpdate: TodoStatus = 'DONE'
  const todoStatusBeforeUpdate: TodoStatus = 'TODO'
  MockDate.set('2021-06-08')
  const acceptTrip = new AcceptTrip(
    TodoRepo,
    TaskRepo,
    TripRepo,
    Workflow,
    FleetApiService,
    DispatchApiService,
    UrlShortenApiService,
    mockGenerateSequenceId,
    mockTripDomain,
    mockHoldWidtdraw,
    mockReleaseWidtdraw,
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Should accept trip', () => {
    it('Auto assign courier, Should update Todo status and Update dispatching ticket status', async () => {
      UrlShortenApiService.generateUrl.mockResolvedValue('url')
      TodoRepo.updateById.mockResolvedValue({ status: todoStatusRequestUpdate })
      TaskRepo.updateStatus.mockResolvedValue(null)
      TripRepo.update.mockResolvedValue(null)
      TripRepo.getTripById.mockResolvedValue({
        metadata: { orderId: 'mock' },

        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })

      DispatchApiService.getTicket.mockResolvedValue({ status: 'PROCESSING' })
      DispatchApiService.updateTicket.mockResolvedValue(null)

      const result = await acceptTrip.process(autoAssignCourierTodo, input)

      expect(result.status).toEqual(todoStatusRequestUpdate)

      expect(FleetApiService.getStaff).toHaveBeenCalledWith('userId_111')
      expect(TripRepo.getTripById).toHaveBeenCalledWith('tripId_111', {
        populate: [{ path: 'tasks', populate: [{ path: 'taskTypeId' }] }],
      })
      expect(TodoRepo.updateById).toHaveBeenCalledWith('todoId_111', {
        result: {
          date: new Date('2021-06-08'),
          lat: 13.6851301,
          lng: 100.6088319,
          userId: 'userId_111',
        },
        status: 'DONE',
      })
      expect(TaskRepo.updateStatus).toHaveBeenCalledWith('taskId_111', 'DONE')
      expect(DispatchApiService.updateTicket).toHaveBeenCalledWith(
        'dispatch_ticket_id',
        'dispatch_token_id',
      )

      expect(mockGenerateSequenceId.acceptTripReferenceId).not.toHaveBeenCalled()
      expect(TripRepo.update).toHaveBeenCalledWith('tripId_111', {
        detailStatus: 'ACCEPT_TRIP.PROCESS.DOING',
        detailStatusMetadata: {
          refOrderStatuses: null,
          taskId: undefined,
          taskTypeCode: 'ACCEPT_TRIP',
          todoId: 'todoId_111',
          todoTypeCode: 'PROCESS',
        },
        status: 'DOING',
      })
      expect(UrlShortenApiService.generateUrl).toHaveBeenCalled()
      expect(Workflow.start).toHaveBeenCalledWith(
        'transactionId_1',
        { name: 'PROJECT01_TRANSPORT', rev: '1' },
        {
          companyId: 'companyId01',
          companyName: 'CPF',
          orderId: 'orderId01',
          orderReferenceId: 'orderReferenceId01',
          projectId: 'projectId01',
          staffId: 'staff_id',
          trackingURLs: [{ refOrderId: 'mock', trackingURL: 'url' }],
          trip: {
            _id: 'tripId_111',
            metadata: { orderId: 'mock' },
            windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
          },
          tripId: 'tripId_111',
          userId: 'userId_111',
        },
      )
    })

    it('Manual assign courier, Should update Todo status', async () => {
      UrlShortenApiService.generateUrl.mockResolvedValue('url')
      TodoRepo.updateById.mockResolvedValue({ status: todoStatusRequestUpdate })
      TaskRepo.updateStatus.mockResolvedValue(null)
      TripRepo.update.mockResolvedValue(null)
      TripRepo.getTripById.mockResolvedValue({
        metadata: { orderId: 'mock' },
        orderId: 'orderId01',
        orderReferenceId: 'orderReferenceId01',
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })

      const result = await acceptTrip.process(manualAssignCourierTodo, input)

      expect(result.status).toEqual(todoStatusRequestUpdate)

      expect(FleetApiService.getStaff).toHaveBeenCalledWith('userId_111')
      expect(TripRepo.getTripById).toHaveBeenCalledWith('tripId_111', {
        populate: [{ path: 'tasks', populate: [{ path: 'taskTypeId' }] }],
      })
      expect(TaskRepo.updateStatus).toHaveBeenCalledWith('taskId_111', 'DONE')
      expect(TodoRepo.updateById).toHaveBeenCalledWith('todoId_111', {
        result: {
          date: new Date('2021-06-08'),
          lat: 13.6851301,
          lng: 100.6088319,
          userId: 'userId_111',
        },
        status: 'DONE',
      })
      expect(DispatchApiService.updateTicket).not.toHaveBeenCalled()
      expect(TripRepo.update).toHaveBeenCalledWith('tripId_111', {
        detailStatus: 'ACCEPT_TRIP.PROCESS.DOING',
        detailStatusMetadata: {
          refOrderStatuses: null,
          taskId: undefined,
          taskTypeCode: 'ACCEPT_TRIP',
          todoId: 'todoId_111',
          todoTypeCode: 'PROCESS',
        },
        status: 'DOING',
      })

      expect(mockGenerateSequenceId.acceptTripReferenceId).not.toHaveBeenCalled()
      expect(UrlShortenApiService.generateUrl).toHaveBeenCalled()
      expect(Workflow.start).toHaveBeenCalledWith(
        'transactionId_1',
        {
          name: 'PROJECT01_TRANSPORT',
          rev: '1',
        },
        {
          companyId: 'companyId01',
          companyName: 'CPF',
          orderId: 'orderId01',
          orderReferenceId: 'orderReferenceId01',
          projectId: 'projectId01',
          staffId: 'staff_id',
          trackingURLs: [{ refOrderId: 'mock', trackingURL: 'url' }],
          trip: {
            _id: 'tripId_111',
            metadata: { orderId: 'mock' },
            windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
          },
          tripId: 'tripId_111',
          userId: 'userId_111',
        },
      )
    })

    it('should accept multiple trip', async () => {
      UrlShortenApiService.generateUrl.mockResolvedValue('url')
      TodoRepo.updateById.mockResolvedValue({ status: todoStatusRequestUpdate })
      TaskRepo.updateStatus.mockResolvedValue(null)
      TripRepo.update.mockResolvedValue(null)
      TripRepo.getTripById.mockResolvedValue({
        _id: 'tripId_111',
        metadata: { orderId: 'mock', config: { driver: { isAllowToMultipleAcceptTrip: true } } },
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })
      DispatchApiService.getTicket.mockResolvedValue({ status: 'PROCESSING' })
      DispatchApiService.updateTicket.mockResolvedValue(null)
      mockTripDomain.tripActiveList.mockResolvedValue({ data: [{ _id: 'tripId01', metadata: {} }] })
      mockGenerateSequenceId.acceptTripReferenceId.mockResolvedValue('JAN00001')

      const result = await acceptTrip.process(autoAssignCourierTodo, input)

      expect(result.status).toEqual(todoStatusRequestUpdate)

      expect(FleetApiService.getStaff).toHaveBeenCalledWith('userId_111')
      expect(TripRepo.getTripById).toHaveBeenCalledWith('tripId_111', {
        populate: [{ path: 'tasks', populate: [{ path: 'taskTypeId' }] }],
      })
      expect(TaskRepo.updateStatus).toHaveBeenCalledWith('taskId_111', 'DONE')
      expect(TodoRepo.updateById).toHaveBeenCalledWith('todoId_111', {
        result: {
          date: new Date('2021-06-08'),
          lat: 13.6851301,
          lng: 100.6088319,
          userId: 'userId_111',
        },
        status: 'DONE',
      })
      expect(DispatchApiService.updateTicket).toHaveBeenCalledWith(
        'dispatch_ticket_id',
        'dispatch_token_id',
      )

      expect(mockTripDomain.tripActiveList).toHaveBeenCalledWith('staff_id')
      expect(mockGenerateSequenceId.acceptTripReferenceId).toHaveBeenCalledWith({})
      expect(TripRepo.update.mock.calls).toEqual([
        // first called is update metadata.acceptTripReferenceId
        ['tripId_111', { 'metadata.acceptTripReferenceId': 'JAN00001' }],
        // second is update trip detail status
        [
          'tripId_111',
          {
            detailStatus: 'ACCEPT_TRIP.PROCESS.DOING',
            detailStatusMetadata: {
              refOrderStatuses: null,
              taskId: undefined,
              taskTypeCode: 'ACCEPT_TRIP',
              todoId: 'todoId_111',
              todoTypeCode: 'PROCESS',
            },
            status: 'DOING',
          },
        ],
      ])
      expect(UrlShortenApiService.generateUrl).toHaveBeenCalled()
      expect(Workflow.start).toHaveBeenCalledWith(
        'transactionId_1',
        { name: 'PROJECT01_TRANSPORT', rev: '1' },
        {
          companyId: 'companyId01',
          companyName: 'CPF',
          orderId: 'orderId01',
          orderReferenceId: 'orderReferenceId01',
          projectId: 'projectId01',
          staffId: 'staff_id',
          trackingURLs: [{ refOrderId: 'mock', trackingURL: 'url' }],
          trip: {
            _id: 'tripId_111',
            metadata: {
              config: { driver: { isAllowToMultipleAcceptTrip: true } },
              orderId: 'mock',
            },
            windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
          },
          tripId: 'tripId_111',
          userId: 'userId_111',
        },
      )
    })

    it('should use credit wallet', async () => {
      UrlShortenApiService.generateUrl.mockResolvedValue('url')
      TodoRepo.updateById.mockResolvedValue({ status: todoStatusRequestUpdate })
      TaskRepo.updateStatus.mockResolvedValue(null)
      TripRepo.update.mockResolvedValue(null)
      TripRepo.getTripById.mockResolvedValue({
        _id: 'tripId_111',
        metadata: {
          orderId: 'mock',
          config: {
            driver: { isAllowToMultipleAcceptTrip: true },
            wallet: { isCreditWallet: true },
          },
        },
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      mockHoldWidtdraw.holdWithdrawal.mockResolvedValue(true)
      mockReleaseWidtdraw.releaseHoldWithdrawal.mockResolvedValue(null)

      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })
      DispatchApiService.getTicket.mockResolvedValue({ status: 'PROCESSING' })
      DispatchApiService.updateTicket.mockResolvedValue(null)
      mockTripDomain.tripActiveList.mockResolvedValue({ data: [{ _id: 'tripId01', metadata: {} }] })
      mockGenerateSequenceId.acceptTripReferenceId.mockResolvedValue('JAN00001')

      const result = await acceptTrip.process(autoAssignCourierTodo, input)
      expect(mockHoldWidtdraw.holdWithdrawal).toHaveBeenCalledWith('userId_111', {
        _id: 'tripId_111',
        metadata: {
          orderId: 'mock',
          config: {
            driver: { isAllowToMultipleAcceptTrip: true },
            wallet: { isCreditWallet: true },
          },
        },
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      expect(mockReleaseWidtdraw.releaseHoldWithdrawal).not.toBeCalled()

      expect(result.status).toEqual(todoStatusRequestUpdate)

      expect(FleetApiService.getStaff).toHaveBeenCalledWith('userId_111')
      expect(TripRepo.getTripById).toHaveBeenCalledWith('tripId_111', {
        populate: [{ path: 'tasks', populate: [{ path: 'taskTypeId' }] }],
      })
      expect(TaskRepo.updateStatus).toHaveBeenCalledWith('taskId_111', 'DONE')
      expect(TodoRepo.updateById).toHaveBeenCalledWith('todoId_111', {
        result: {
          date: new Date('2021-06-08'),
          lat: 13.6851301,
          lng: 100.6088319,
          userId: 'userId_111',
        },
        status: 'DONE',
      })
      expect(DispatchApiService.updateTicket).toHaveBeenCalledWith(
        'dispatch_ticket_id',
        'dispatch_token_id',
      )

      expect(mockTripDomain.tripActiveList).toHaveBeenCalledWith('staff_id')
      expect(mockGenerateSequenceId.acceptTripReferenceId).toHaveBeenCalledWith({})
      expect(TripRepo.update.mock.calls).toEqual([
        // first called is update metadata.acceptTripReferenceId
        ['tripId_111', { 'metadata.acceptTripReferenceId': 'JAN00001' }],
        // second is update trip detail status
        [
          'tripId_111',
          {
            detailStatus: 'ACCEPT_TRIP.PROCESS.DOING',
            detailStatusMetadata: {
              refOrderStatuses: null,
              taskId: undefined,
              taskTypeCode: 'ACCEPT_TRIP',
              todoId: 'todoId_111',
              todoTypeCode: 'PROCESS',
            },
            status: 'DOING',
          },
        ],
      ])
      expect(UrlShortenApiService.generateUrl).toHaveBeenCalled()
      expect(Workflow.start).toHaveBeenCalledWith(
        'transactionId_1',
        { name: 'PROJECT01_TRANSPORT', rev: '1' },
        {
          companyId: 'companyId01',
          companyName: 'CPF',
          orderId: 'orderId01',
          orderReferenceId: 'orderReferenceId01',
          projectId: 'projectId01',
          staffId: 'staff_id',
          trackingURLs: [{ refOrderId: 'mock', trackingURL: 'url' }],
          trip: {
            _id: 'tripId_111',
            metadata: {
              config: {
                driver: { isAllowToMultipleAcceptTrip: true },
                wallet: { isCreditWallet: true },
              },
              orderId: 'mock',
            },
            windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
          },
          tripId: 'tripId_111',
          userId: 'userId_111',
        },
      )
    })
  })

  describe('Should not accept trip', () => {
    it('accept inactive trip, should throw ValidateError', async () => {
      await expect(acceptTrip.process(inactiveTrip, input)).rejects.toThrow(ValidateError)
    })

    it('accept inactive task, should throw ValidateError', async () => {
      await expect(acceptTrip.process(inactiveTask, input)).rejects.toThrow(ValidateError)
    })

    it('accept completed todo, should throw ValidateError', async () => {
      await expect(acceptTrip.process(completedTodo, input)).rejects.toThrow(ValidateError)
    })

    it('should not accept trip more than or equal config multipleAcceptTripLimit', async () => {
      TripRepo.getTripById.mockResolvedValue({
        metadata: {
          orderId: 'mock',
          config: {
            driver: {
              isAllowToMultipleAcceptTrip: true,
              multipleAcceptTripLimit: 3,
            },
          },
        },
        orderId: 'orderId01',
        orderReferenceId: 'orderReferenceId01',
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })
      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })
      mockTripDomain.tripActiveList.mockResolvedValue({ data: [], total: 3 })

      await expect(acceptTrip.process(autoAssignCourierTodo, input)).rejects.toThrow(ValidateError)
    })
  })

  describe('Update Some process error', () => {
    it('Update Todo status success but update Dispatching ticket failed, should update Todo status to previous status', async () => {
      Workflow.complete.mockResolvedValue(null)
      FleetApiService.getStaff.mockResolvedValue({ _id: 'staff_id' })
      TripRepo.getTripById.mockResolvedValue({
        metadata: {},
        orderId: 'orderId01',
        orderReferenceId: 'orderReferenceId01',
        tasks: [{ taskId: 'mock', taskTypeId: { code: 'DELIVERY' } }],
      })

      TodoRepo.updateById
        .mockResolvedValueOnce({ status: todoStatusRequestUpdate })
        .mockResolvedValueOnce({ status: todoStatusBeforeUpdate })
      TaskRepo.updateStatus.mockResolvedValue(null)
      TripRepo.update.mockResolvedValue(null)
      TripRepo.updateStatus.mockResolvedValue(null)

      DispatchApiService.getTicket.mockResolvedValue({ status: 'PROCESSING' })
      DispatchApiService.updateTicket.mockRejectedValue(new Error('invalid ticket id'))

      Workflow.start.mockResolvedValue(null)

      try {
        await acceptTrip.process(autoAssignCourierTodo, input)
      } catch (error) {
        expect(TodoRepo.updateById).toHaveBeenCalledTimes(2)
        expect(TaskRepo.updateStatus).toHaveBeenCalledTimes(2)
        expect(TripRepo.updateStatus).toHaveBeenCalled()
        expect(DispatchApiService.updateTicket).toHaveBeenCalled()
      }
    })
  })
})
