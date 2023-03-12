// @flow
import R from 'ramda'
import { conductorClient } from '../../../libraries/conductor'
import { getTaskInstantBySubWorkflow } from '../../conductor/getTaskInstantBySubWorkflow'
import { findTransportTaskType } from '../../todo/conductorTransportTracking'
import getWorkflowById from '../../conductor/getWorkflowInstantById'
import { compareTaskStateMaximum } from '../../conductor/compareTaskStateMaximum'
import logger from '../../../libraries/logger'
import { TaskStatus } from '../../../constants/task'

const CONDUCTOR_STATUS_INPROGRESS = `IN_PROGRESS`
const CONDUCTOR_STATUS_COMPLETED = 'COMPLETED'

export default async (task: any) => {
  if (task.status !== TaskStatus.DONE) return
  const isTrackWorkflowConductorEngine = task.workflowInstanceId && task.workflowTaskId
  if (isTrackWorkflowConductorEngine) {
    const workflowInstant = await getWorkflowById(task.workflowInstanceId)
    const TransportTaskInstant = findTransportTaskType(workflowInstant.data)
    const taskMainOrSubWorkflow = await getTaskInstantBySubWorkflow(TransportTaskInstant)

    const taskInstantFinal = taskMainOrSubWorkflow
      ? compareTaskStateMaximum(taskMainOrSubWorkflow)
      : {}

    const statuses = [
      ...R.pathOr({}, ['statuses'], taskInstantFinal),
      {
        status: `Task ${task.sequenceSystem} ${task.deliveryStatus} Completed`,
        updatedAt: Date.now(),
      },
    ]

    const outputData = { ...(taskInstantFinal || {}), statuses }
    const conductorUpdateStatus =
      task.extensionType === 'TAXI' ? CONDUCTOR_STATUS_INPROGRESS : CONDUCTOR_STATUS_COMPLETED
    await conductorClient.updateTask({
      workflowInstanceId: task.workflowInstanceId,
      taskId: task.workflowTaskId,
      outputData,
      status: conductorUpdateStatus,
    })
  }
  logger.info({ event: 'UPDATE_TASK', taskId: task._id })
}
