// @flow
import R from 'ramda'
import { conductorClient } from '../../libraries/conductor'
import { WorkflowInstant } from '../conductor/Types'
import getWorkflowById from '../conductor/getWorkflowInstantById'
import { getTaskInstantBySubWorkflow } from '../conductor/getTaskInstantBySubWorkflow'
import { compareTaskStateMaximum } from '../conductor/compareTaskStateMaximum'

const IN_PROGRESS = `IN_PROGRESS`
const TMS_TRANSPORT = `TMS_TRANSPORT`

export const findTransportTaskType = (workflowInstant: WorkflowInstant) => {
  if (workflowInstant.workflowName === 'TRUE_RYDE_DELIVERY_FLOW' || workflowInstant.workflowName === 'TRUE_RYDE_DELIVERY_ADVANCE_PAYMENT_FLOW') {
    return workflowInstant.tasks.find(task => task.taskType === 'TRD_TMS_TRANSPORT')
  }
  return workflowInstant.tasks.find(task => task.taskType === TMS_TRANSPORT)
}

export default async (workflowInstanceId, workflowTaskId, todoName) => {
  const workflowInstant = await getWorkflowById(workflowInstanceId)
  const TransportTaskInstant = findTransportTaskType(workflowInstant.data)
  const taskMainOrSubWorkflow = await getTaskInstantBySubWorkflow(TransportTaskInstant)

  const taskInstantFinal = taskMainOrSubWorkflow
    ? compareTaskStateMaximum(taskMainOrSubWorkflow)
    : {}

  const newStatus = todoName
  const statuses = [
    ...R.pathOr({}, ['statuses'], taskInstantFinal),
    { status: `${newStatus}`, updatedAt: Date.now() },
  ]
  const outputData = {
    ...(taskInstantFinal || {}),
    statuses,
  }

  await conductorClient.updateTask({
    workflowInstanceId,
    taskId: TransportTaskInstant.taskId,
    status: IN_PROGRESS,
    outputData,
  })

  return {
    workflowTaskId: TransportTaskInstant.taskId,
    workflowType: TransportTaskInstant.taskType,
    workflowInstanceId,
  }
}
