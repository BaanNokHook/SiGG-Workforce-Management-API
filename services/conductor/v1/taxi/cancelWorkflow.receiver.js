import R from 'ramda'
import { conductorClient } from '../../../../libraries/conductor'
import logger from '../../../../libraries/logger'
import getWorkflowById from '../../../../domains/conductor/getWorkflowInstantById'
import { getTaskLastByWorkflowInstant } from '../../../../domains/conductor/getTaskLastByWorkflowInstant'
import { getTaskInstantBySubWorkflow } from '../../../../domains/conductor/getTaskInstantBySubWorkflow'
import { compareTaskStateMaximum } from '../../../../domains/conductor/compareTaskStateMaximum'

const TASK_NAME = 'TMS_CANCEL_FLOW'

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      logger.info(`${TASK_NAME} START`)
      const { inputData } = data
      const { orders } = inputData

      try {
        const { workflowId } = orders
        const requestBy = R.path(['reason', 'requestBy'], orders)
        const requestRole = R.path(['reason', 'requestRole'], orders)

        logger.info({
          workflowId,
          requestBy,
          requestRole,
        })

        const workflowInstant = await getWorkflowById(workflowId)
        const TaskInstantLast = getTaskLastByWorkflowInstant(workflowInstant)
        const taskMainOrSubWorkflow = await getTaskInstantBySubWorkflow(TaskInstantLast)

        const taskInstantFinal = taskMainOrSubWorkflow
          ? compareTaskStateMaximum(taskMainOrSubWorkflow)
          : {}

        logger.info({ event: TASK_NAME })

        updater.complete({
          outputData: {
            workflowIdFailed: workflowId,
            ...(taskInstantFinal && {
              ...taskInstantFinal,
            }),
            statuses: [
              ...(taskInstantFinal.statuses || {}),
              {
                status: `TMS_CANCEL_WORKFLOW_SUCCESS`,
                updatedAt: Date.now(),
              },
            ],
          },
        })
      } catch (error) {
        logger.error({ event: TASK_NAME, err: error })
        updater.fail({
          taskId: data.taskId,
          outputData: {
            ...inputData,
            statuses: [
              ...inputData.statuses,
              { status: 'TMS_CANCEL_WORKFLOW_FAILED', updatedAt: Date.now() },
            ],
            error: JSON.stringify(error, null, 2),
          },
        })
      }
    },
    { pollingIntervals: 100, autoAck: true, maxRunner: 5 },
    true,
  )
}
