import cfmService from '../../../../../services/cfm'

export class CFMTaskCreatedEventHandler {
  constructor(_cfmService) {
    this.cfmService = _cfmService
  }

  buildPayload(task) {
    const { orderId, projectId, companyId, information } = task
    const { ticketNo, prodId } = information
    return {
      productID: prodId,
      ticketNumber: ticketNo,
      workOrderNO: orderId,
      companyId,
      projectId,
      actionType: 'Created',
      requestType: '2',
    }
  }

  updateToCFM(task) {
    const { taskTypeId } = task
    const payload = this.buildPayload(task)
    return this.cfmService.updateWorkOrderStatus(payload, taskTypeId)
  }
}

export default new CFMTaskCreatedEventHandler(cfmService)
