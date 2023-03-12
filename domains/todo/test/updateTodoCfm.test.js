import moment from 'moment-timezone'
import UpdateTodoCFM from '../events/updateTodoEvent/handler/updateTodoCFM'
import { payloadMock, result, mockStaff } from './__mocks__/updateTodoCfmMock'

describe('Update todo CFM', () => {
  const cfmService = {
    updateWorkOrderStatus: jest.fn(),
  }
  const fleetService = {
    get: jest.fn(),
  }
  const updateTodoCfm = new UpdateTodoCFM(cfmService, fleetService)

  beforeEach(() => {
    jest.clearAllMocks()
    Date.now = jest.fn(() => new Date(Date.UTC(2020, 4, 1)).valueOf())
  })

  it('should not send payload of E2E todo type when todo list not successfully', async () => {
    const results = await updateTodoCfm.update({
      todo: {
        todoType: {
          name: 'E2E',
        },
      },
    })
    expect(cfmService.updateWorkOrderStatus).not.toHaveBeenCalled();
  })

  it('should not send status to cfm when task is sccd', async () => {
    const sccdTaskMock = {
      ...payloadMock,
      todo: {
        ...payloadMock.todo,
        taskId: {
          ...payloadMock.taskId,
          information: {
            metaInformation: {
              baseInformation:{
                createUser:'SCCD'
              }
            }
          }
        }
      }
    }
    const results = await updateTodoCfm.update(sccdTaskMock)
    expect(cfmService.updateWorkOrderStatus).not.toHaveBeenCalled();
  })

  it('should  send status to cfm when task is not sccd', async () => {
    fleetService.get.mockResolvedValue({
      status: 'OK',
      statusCode: 200,
      data: {
        data: { ...mockStaff },
      },
    })

    const sccdTaskMock = {
      ...payloadMock,
      todo: {
        ...payloadMock.todo,
        taskId: {
          ...payloadMock.taskId,
          information: {
            metaInformation: {
              baseInformation:{
                createUser:'CFM'
              }
            }
          }
        }
      }
    }
    const results = await updateTodoCfm.update(sccdTaskMock)
    expect(cfmService.updateWorkOrderStatus).toHaveBeenCalled();
  })

  it('should update work order status successfully when SET_OFF status DONE', async () => {
    fleetService.get.mockResolvedValue({
      status: 'OK',
      statusCode: 200,
      data: {
        data: { ...mockStaff },
      },
    })

    payloadMock.todo.todoType.name = 'SET_OFF'
    await expect(updateTodoCfm.update(payloadMock)).resolves.not.toThrow()
  })

  it('should update work order status successfully when ENTER_SITE status DONE', async () => {
    fleetService.get.mockResolvedValue({
      status: 'OK',
      statusCode: 200,
      data: {
        data: { ...mockStaff },
      },
    })

    payloadMock.todo.todoType.name = 'ENTER_SITE'
    await expect(updateTodoCfm.update(payloadMock)).resolves.not.toThrow()
  })

  it('should update work order status successfully when E_SIGNATURE status DONE', async () => {
    fleetService.get.mockResolvedValue({
      status: 'OK',
      statusCode: 200,
      data: {
        data: { ...mockStaff },
      },
    })

    payloadMock.todo.todoType.name = 'E_SIGNATURE'
    await expect(updateTodoCfm.update(payloadMock)).resolves.not.toThrow()
  })

  it('should send a message payload of SET_OFF todo type successfully.', async () => {
    payloadMock.todo.todoType.name = 'SET_OFF'
    const payload = await updateTodoCfm.buildPayload(payloadMock)
    expect(payload).toStrictEqual({
      productID: 'productID',
      workOrderNO: 'orderId',
      ticketNumber: 'ticketNumber',
      actionName: 'firstname lastname',
      actionID: 'staffCode',
      actionType: 'Set Off',
      updID: 'staffCode',
      updName: 'firstname lastname',
      companyId: 'companyId',
      projectId: 'projectId',
      requestType: '2',
      actionDate: moment().tz('Asia/Bangkok').format('DDMMYYYYHHmmss'),
    })
  })

  it('should send a message payload of ENTER_SITE todo type successfully.', async () => {
    payloadMock.todo.todoType.name = 'ENTER_SITE'
    const payload = await updateTodoCfm.buildPayload(payloadMock)
    expect(payload).toStrictEqual({
      productID: 'productID',
      workOrderNO: 'orderId',
      ticketNumber: 'ticketNumber',
      actionName: 'firstname lastname',
      actionID: 'staffCode',
      actionType: 'Entersite',
      updID: 'staffCode',
      updName: 'firstname lastname',
      companyId: 'companyId',
      projectId: 'projectId',
      requestType: '2',
      actionDate: moment().tz('Asia/Bangkok').format('DDMMYYYYHHmmss'),
    })
  })

  it('should send a message payload of E_SIGNATURE todo type successfully.', async () => {
    payloadMock.todo.todoType.name = 'E_SIGNATURE'
    const payload = await updateTodoCfm.buildPayload(payloadMock)
    expect(payload).toStrictEqual({
      productID: 'productID',
      workOrderNO: 'orderId',
      ticketNumber: 'ticketNumber',
      actionName: 'firstname lastname',
      actionID: 'staffCode',
      actionType: 'Processed',
      updID: 'staffCode',
      updName: 'firstname lastname',
      companyId: 'companyId',
      projectId: 'projectId',
      requestType: '2',
      actionDate: moment().tz('Asia/Bangkok').format('DDMMYYYYHHmmss'),
    })
  })
  
})
