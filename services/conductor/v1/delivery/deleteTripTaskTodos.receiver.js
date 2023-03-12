import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import cancelFlowError from '../../../../domains/conductor/cancelFlowError'
import cancelVoucherByTripId from '../../../../domains/voucher/cancelVoucherByTripId'
import logger from '../../../../libraries/logger'

const TASK_NAME = `TRD_TMS_DELETE_TRIP_TASK_TODOS`

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      logger.info(`${TASK_NAME} start`, data)

      const { inputData } = data
      const { orders } = inputData
      const carrier = { 'uber-trace-id': R.path(['uber-trace-id'], orders) }
      const childSpan = startJaegerSpan(`${TASK_NAME}`, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
      })
      childSpan.setTag('taskName', TASK_NAME)
      childSpan.setTag('orderId', R.path(['order', 'orderId'], orders))
      childSpan.log({ inputData })

      try {
        const respCancelFlow = await cancelFlowError(data)
        /** In case error from main workflow and sub workflow */

        const orderId = R.pathOr('', ['orderId'], respCancelFlow)
        /** Cancel Voucher By TripId */
        await cancelVoucherByTripId(orderId, 'fail')
        logger.info({ event: TASK_NAME, orderId })

        childSpan.log({
          outputData: respCancelFlow,
        })
        await updater.complete({ outputData: { ...respCancelFlow } })
        childSpan.finish()
      } catch (error) {
        logger.error({ event: TASK_NAME, err: error })
        childSpan.setTag('error', true)
        childSpan.log({ error })
        childSpan.finish()
        await updater.fail({ taskId: data.taskId })
      }
    },
    { pollingIntervals: 100, autoAck: true, maxRunner: 5 },
    true,
  )
}
