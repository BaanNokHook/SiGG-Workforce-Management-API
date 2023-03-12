import { CFMTaskCreatedEventHandler } from './cfmTaskCreatedEventHandler'

describe('CFMTaskCreatedEventHandler should work correctly', () => {
  const cfmService = {
    updateWorkOrderStatus: jest.fn(),
  }
  const cfmTaskCreatedEventHandler = new CFMTaskCreatedEventHandler(cfmService)

  it('method updateToCFM. should call cfm service [updateWorkOrderStatus] correctly', () => {
    const task = {
      orderId: 'orderId',
      projectId: 'projectId',
      companyId: 'companyId',
      information: { ticketNo: 'ticketNo', prodId: 'prodId' },
    }
    cfmTaskCreatedEventHandler.updateToCFM(task)
    expect(cfmService.updateWorkOrderStatus).toHaveBeenCalled()
  })

  it('method buildPayload. should build payload format correctly', () => {
    const task = {
      orderId: 'orderId',
      projectId: 'projectId',
      companyId: 'companyId',
      information: { ticketNo: 'ticketNo', prodId: 'prodId' },
    }
    const payload = cfmTaskCreatedEventHandler.buildPayload(task)
    expect(payload).toStrictEqual({
      productID: 'prodId',
      ticketNumber: 'ticketNo',
      workOrderNO: 'orderId',
      companyId: 'companyId',
      projectId: 'projectId',
      actionType: 'Created',
      requestType: '2',
    })
  })
})
