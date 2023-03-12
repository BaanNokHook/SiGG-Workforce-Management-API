// @flow
import R from 'ramda'
import { isRequiredField } from '../../utils/domain'
import { conductorClient } from '../../libraries/conductor'
import startWorkflow from './startWorkflow'
import cancelVoucherByTripId from '../voucher/cancelVoucherByTripId'
import orderHttp from '../../services/httpService/order'
import logger from '../../libraries/logger'

const validate = {
  workflowInstanceId: true,
  reason: true,
}

const TMS_CANCEL_WORKFLOW = `TMS_CANCEL_WORKFLOW`

type ResponseWorkflow = {
  message: string,
  workflowInstanceId: string,
}

type Reason = {
  _id: string,
  requestBy: string, // userId from request
  requestRole: 'DRIVER' | 'PASSENGER',
  referenceId: string, // tripId
  referenceType: 'TRIP',
  requestDate: Date,
  projectId: string,
  companyId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  extensionFlow: string,
  note: string,
}

type Role = 'DRIVER' | 'PASSENGER' | 'COURIER' | 'ADMIN'

type CancelWorkflow = {
  workflowInstanceId: string,
  reason: Reason,
  orderId: string,
  requestRole: Role,
}

const event = 'WORKFLOW_CANCEL_TRIP'

const getUpdateOrderData = (role: Role, orderId: string) => {
  let updateOrderData = {
    orderId,
    status: {},
  }
  switch (role) {
    case 'DRIVER':
      updateOrderData.status = {
        status: 'ORDER_FAILED',
        updatedAt: Date.now(),
        metadata: {
          requestBy: role,
          reason: 'cancel by driver app',
        },
      }
      break
    case 'PASSENGER':
      updateOrderData.status = {
        status: 'ORDER_CANCELLED',
        updatedAt: Date.now(),
        metadata: {
          requestBy: role,
          reason: 'cancel by passenger app',
        },
      }
      break
    default:
      updateOrderData = null
  }

  return updateOrderData
}

const updateOrderById = async (orderId: string, role: Role) => {
  const updateOrderData = getUpdateOrderData(role, orderId)
  if (updateOrderData) {
    await orderHttp.request({
      method: 'PUT',
      url: `v1/order/status`,
      data: updateOrderData,
    })
  }
}

const cancelWorkflow = async (payload) => {
  const { workflowInstanceId } = payload
  await conductorClient.terminateWorkflow(workflowInstanceId, payload)
  const result: ResponseWorkflow = await startWorkflow({
    workflowName: TMS_CANCEL_WORKFLOW,
    data: {
      workflowId: workflowInstanceId,
      ...payload,
    },
  })

  logger.info({ event }, JSON.stringify(result))
  return result
}

export default async (data: CancelWorkflow) => {
  const { orderId, requestRole } = data
  isRequiredField(data, validate)
  const result = await cancelWorkflow(data)
  const tripId = R.pathOr('', ['reason', 'referenceId'], data)
  await cancelVoucherByTripId(tripId, 'cancel')
  await updateOrderById(orderId, requestRole)
  return result
}
