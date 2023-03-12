import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import cancelFlowError from '../../../../domains/conductor/cancelFlowError'
import broadcastService from '../../../httpService/broadcast'
import cancelVoucherByTripId from '../../../../domains/voucher/cancelVoucherByTripId'
import logger from '../../../../libraries/logger'

const TASK_NAME = `TMS_DELETE_TRIP_TASK_TODOS`

const getPassengersFromTask = task => {
  const { passengers } = task
  return passengers.map(ps => ps.userId)
}

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {

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
        const tasks = R.pathOr(null, ['order', 'tasks'], orders) || orders.tasks

        const passengerUserIds = !R.isEmpty(tasks)
          ? R.flatten(tasks.map(getPassengersFromTask))
          : []

        logger.info({ event: TASK_NAME })

        const bodyReqBroadcast = {
          userId: R.uniq(passengerUserIds),
          data: {
            broadcast: {
              event: 'taxi_passenger_findDriver_failed',
              answer: ['receive', 'reject'],
              message: {
                th: {
                  title: '',
                  description: '',
                },
              },
            },
          },
          strategy: 'SEQUENCE',
          timeoutPerMessage: 120000,
        }

        await broadcastService.post({
          thing: 'v1/broadcast',
          body: bodyReqBroadcast,
        })

        childSpan.setTag('broadcast', true)

        const orderId = R.pathOr('', ['orderId'], respCancelFlow)
        /** Cancel Voucher By TripId */
        await cancelVoucherByTripId(orderId, 'fail')

        childSpan.log({
          outputData: respCancelFlow,
        })
        await updater.complete({ outputData: { ...respCancelFlow } })
        childSpan.finish()
        logger.info({ event: TASK_NAME, orderId })
      } catch (error) {
        logger.error({ event: TASK_NAME, err: error })
        childSpan.setTag('error', true)
        childSpan.log({ error })
        childSpan.finish()
        await updater.fail({
          taskId: data.taskId,
          outputData: {
            ...data.inputData,
            statuses: [
              ...R.path(['inputData', 'statuses'], data),
              { status: 'TMS_DELETE_TRIP_TASK_TODOS_FAILED', updatedAt: Date.now() },
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
