import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP, injectJaeger } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import tripRepository from '../../../../models/trip.repository'
import { checkUpdate } from '../../../../utils/domain'
import logger from '../../../../libraries/logger'

const TASK_NAME = 'TRD_TMS_TRANSPORT'

const isCompleteTransport = R.pathEq(['outputData', 'completeTransport'], true)

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      logger.info(`${TASK_NAME} start`)
      const carrier = { 'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data) }
      const childSpan = startJaegerSpan(`${TASK_NAME}`, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
      })
      const uberTraceId = R.path(['inputData', 'uber-trace-id'], data)
      injectJaeger(childSpan, FORMAT_TEXT_MAP, carrier)
      childSpan.setTag('taskName', `${TASK_NAME}`)
      childSpan.setTag('orderId', R.path(['inputData', 'orderId'], data))
      childSpan.log({ inputData: data.inputData })

      const {
        workflowInstanceId,
        taskDefName,
        taskId: workflowTaskId,
        inputData = {},
        outputData = {},
        pollCount,
      } = data

      try {
        const { tripId } = inputData
        await checkUpdate(
          tripRepository,
          { _id: tripId },
          { workflowInstanceId, workflowType: taskDefName, workflowTaskId },
        )

        logger.info(`${TASK_NAME} Updated workflowInstanceId for trip ${tripId}`)

        if (pollCount === 1) {
          logger.info(`${TASK_NAME} FIRST TIME INPROGRESS ${tripId}`)
          await updater.inprogress({
            callbackAfterSeconds: Number.MAX_SAFE_INTEGER,
            outputData: {
              ...inputData,
              statuses: [
                ...inputData.statuses,
                { status: 'START_TRANSPORT', updatedAt: Date.now() },
              ],
              'uber-trace-id': uberTraceId,
            },
            logs: ['START_TRANSPORT'],
          })
        }

        if (pollCount > 1 && isCompleteTransport(data)) {
          logger.info(`${TASK_NAME} COMPLETED ${tripId}`)
          await updater.complete({
            outputData: {
              ...outputData,
              'uber-trace-id': uberTraceId,
            },
            logs: ['TRANSPORT_COMPLETED'],
          })

          childSpan.log({
            outputData: { ...outputData, 'uber-trace-id': uberTraceId },
          })
        }

        if (pollCount > 1 && !isCompleteTransport(data)) {
          logger.info(`${TASK_NAME} SECOND TIME INPROGRESS ${tripId}`)
          await updater.inprogress({
            callbackAfterSeconds: Number.MAX_SAFE_INTEGER,
            outputData: {
              ...outputData,
              'uber-trace-id': uberTraceId,
            },
            logs: [`TRANSPORT_IN_PROGRESS_${R.last(outputData.statuses).status}`],
          })
        }
        childSpan.finish()
      } catch (error) {
        const conductorState = R.isEmpty(outputData) || R.isEmpty(inputData)
        const getStatuses = conductorState.statuses || []
        logger.error(`${TASK_NAME} FAILURE`)
        logger.error(error)
        childSpan.log({ error })
        childSpan.setTag('error', true)
        childSpan.finish()
        await updater.fail({
          taskId: data.taskId,
          outputData: {
            ...conductorState,
            cancelWorkflow: false,
            statuses: [...getStatuses, { status: 'TRANSPORT_FAILED', updatedAt: Date.now() }],
            error: JSON.stringify(error, null, 2),
            'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
          },
        })
      }
    },
    { pollingIntervals: 100, autoAck: true, maxRunner: 5 },
    true,
  )
}
