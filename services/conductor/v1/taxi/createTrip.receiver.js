import R from 'ramda'
import debug from 'debug'
import { startJaegerSpan, FORMAT_TEXT_MAP, injectJaeger } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import createTrip from '../../../../domains/trip/taxiTrip'
import extensionFlowRepository from '../../../../models/extensionFlow.repository'
import { checkFindOne } from '../../../../utils/domain'
import graylog from '../../../../utils/graylog.util'
import broadcastService from '../../../httpService/broadcast'

const TASK_NAME = 'TMS_CREATE_TRIP'
const log = debug(`app:${TASK_NAME}`)

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      console.log(`${TASK_NAME} start`)
      const carrier = { 'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data) }
      const childSpan = startJaegerSpan(`${TASK_NAME}`, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
        // childOf: { fceaormat: FORMAT_TEXT_MAP, injectData: carrier },
      })

      childSpan.setTag('taskName', `${TASK_NAME}`)
      childSpan.setTag('orderId', R.path(['inputData', 'orders', 'orderId'], data))
      childSpan.log({ inputData: data.inputData })

      const _graylog = graylog('SERVICE', 'CONDUCTOR', TASK_NAME, [
        { name: 'orderId', value: R.path(['inputData', 'orderId'], data), logInMessage: true },
        { name: 'taskName', value: TASK_NAME },
        { name: 'taskId', value: R.path(['taskId'], data) },
        { name: 'workflowInstanceId', value: R.path(['mainWorkflowInstantId'], data) },
      ])
      _graylog.info('START')

      try {
        const { taskId: workflowTaskId, workflowType } = data
        const { tasks, orders, orderId, statuses } = data.inputData

        const getExtensionConfig = await checkFindOne(extensionFlowRepository, {
          name: orders.extensionFlow,
        })

        const orderPickFields = R.pick(
          ['extensionType', 'extensionFlow', 'payment', 'orderId', 'note', 'type'],
          orders,
        )
        const options = {
          ...orderPickFields,
          workflowInstanceId: R.path(['inputData', 'mainWorkflowInstantId'], data),
          workflowTaskId,
          workflowType,
          vehicleType: R.path(
            ['tripRequired', 'isDriver', 'vehicleType'],
            getExtensionConfig.toObject(),
          ),
          typeLabel: R.path(['metadata', 'typeLabel'], orders),
        }

        const newTrip = await createTrip(tasks, options)
        console.log(`${TASK_NAME} complete`)
        _graylog.info('INFO.CREATED_TRIP', { newTrip })
        const broadcastConfig =
          R.path(['tripRequired', 'isDriver', 'broadcastConfig'], getExtensionConfig.toObject()) ||
          {}
        const driverCriteria =
          R.path(['tripRequired', 'isDriver', 'criteria'], getExtensionConfig.toObject()) || {}

        driverCriteria['staffSkills.skill'] = R.path(
          ['tripRequired', 'isDriver', 'staffSkills.skill'],
          getExtensionConfig.toObject(),
        )

        const vehicleType = R.path(
          ['tripRequired', 'isDriver', 'vehicleType'],
          getExtensionConfig.toObject(),
        )

        console.log(`${TASK_NAME} :: ${newTrip._id}`)

        const bodyReqBroadcast = {
          userId: [R.head(R.pathOr([], ['passengers'], newTrip))],
          data: {
            broadcast: {
              event: 'trip_created',
              answer: ['recieve', 'reject'],
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
        _graylog.info('INFO.BROADCAST_DONE')
        childSpan.setTag('tripId', newTrip._id)
        childSpan.setTag('error', false)
        childSpan.log({
          outputData: {
            orderId,
            driverCriteria,
            vehicleType,
            broadcastConfig,
            tripId: newTrip._id,
            statuses: [...statuses, { status: 'ORDER_CREATED_TRIP', updatedAt: Date.now() }],
            'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
          },
        })
        childSpan.finish()
        await updater.complete({
          outputData: {
            orderId,
            driverCriteria,
            vehicleType,
            broadcastConfig,
            tripId: newTrip._id,
            statuses: [...statuses, { status: 'ORDER_CREATED_TRIP', updatedAt: Date.now() }],
            'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
          },
        })
        _graylog.info('COMPLETE.ORDER_CREATED_TRIP')
      } catch (error) {
        _graylog.error('ERROR.ORDER_CREATED_TRIP_FAILED', null, error)
        console.log(`${TASK_NAME}: error`, error)
        childSpan.log({ error })
        childSpan.setTag('error', true)
        childSpan.finish()
        await updater.fail({
          taskId: data.taskId,
          outputData: {
            ...data.inputData,
            statuses: [
              ...R.path(['inputData', 'statuses'], data),
              { status: 'ORDER_CREATED_TRIP_FAILED', updatedAt: Date.now() },
            ],
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
