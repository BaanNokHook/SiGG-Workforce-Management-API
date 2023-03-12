import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP, injectJaeger } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import extensionFlowRepository from '../../../../models/extensionFlow.repository'
import { checkFindOne } from '../../../../utils/domain'
import createTaskProcess from '../../../../domains/task/createTaskProcess'
import logger from '../../../../libraries/logger'

const TASK_NAME = 'TMS_MAPPING_BASE_MODEL_FOR_DELIVERY'
const DIRECTION = { PICKUP: 'PICK_UP', DELIVERY: 'DELIVER', REPAIR: 'REPAIR' }

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      // console.dir(data, {depth: null})
      logger.info(`${TASK_NAME} start`)
      const carrier = { 'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data) || '' }
      const ctxParentSpan = startJaegerSpan(TASK_NAME, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
      })
      injectJaeger(ctxParentSpan, FORMAT_TEXT_MAP, carrier)
      ctxParentSpan.setTag('taskName', TASK_NAME)
      ctxParentSpan.setTag('orderId', R.pathOr(null, ['inputData', 'orders', 'orderId'], data))
      ctxParentSpan.log({ inputData: data.inputData })

      try {
        const tasks = R.path(['inputData', 'orders', 'tasks'], data)
        const statuses = R.pathOr([], ['inputData', 'statuses'], data)
        const validateAddress = R.find(
          (task) => R.isNil(task.address) || R.keys(task.address).length === 0,
        )(tasks)

        if (validateAddress) {
          return updater.fail({
            taskId: data.taskId,
            outputData: {
              ...data.inputData,
              statuses: [
                ...R.pathOr({}, ['inputData', 'statuses'], data),
                { status: 'ORDER_CANNOT_MAPPING_ADDRESSES', updatedAt: Date.now() },
              ],
              'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
            },
          })
        }

        const getExtensionFlow = await checkFindOne(extensionFlowRepository, {
          name: R.path(['inputData', 'orders', 'extensionFlow'], data),
        })

        const ctxMappingExtension = startJaegerSpan('MAPPING_EXTENSION', {
          isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
        })
        ctxMappingExtension.log({ getExtensionFlow })
        const newTasks = tasks.map((task) => ({
          ...R.omit(['address'], task),
          ...R.pick(['extensionType'], R.path(['inputData', 'orders'], data)),
          extensionFlow: getExtensionFlow.name,
          deliveryStatus: DIRECTION[task.direction],
          geographyId: task.address,
          // passengers,
        }))

        ctxMappingExtension.log({ newTasks })
        ctxMappingExtension.log({ mappingOrder: newTasks })
        const orders = {
          ...R.clone(R.path(['inputData', 'orders'], data)),
          tasks: newTasks,
          extensionFlow: getExtensionFlow.name,
        }

        // const extensionFlow = getExtensionFlow.toObject()
        // const taskFlow = R.indexBy(R.prop('deliveryStatus'), extensionFlow.taskRequired)
        // orders.tasks = taskFlow.PROCESS
        //   ? await createTaskProcess(orders, taskFlow.PROCESS)
        //   : orders.tasks

        ctxMappingExtension.log({ taskProcess: 'SUCCESS' })
        ctxMappingExtension.finish()
        const respBody = {
          orderId: R.pathOr(null, ['orderId'], orders),
          orders,
          statuses: [...statuses, { status: 'ORDER_MAPPING', updatedAt: Date.now() }],
          'uber-trace-id':
            R.path(['uber-trace-id'], carrier) || R.path(['inputData', 'uber-trace-id'], data),
        }

        ctxParentSpan.log({ ctxParentSpan: true })
        updater.complete({ outputData: respBody })
        logger.info(`${TASK_NAME} COMPLETED`)
        ctxParentSpan.log({
          outputData: {
            orderId: R.pathOr(null, ['orderId'], orders),
            statuses: [...statuses, { status: 'ORDER_MAPPING', updatedAt: Date.now() }],
          },
        })

        ctxParentSpan.finish()
      } catch (error) {
        logger.error(`${TASK_NAME} FAILURE`)
        logger.error(error)
        ctxParentSpan.log({ error })
        ctxParentSpan.setTag('error', true)
        ctxParentSpan.finish()
        await updater.fail({
          taskId: data.taskId,
          outputData: {
            ...data.inputData,
            statuses: [
              ...R.path(['inputData', 'statuses'], data),
              { status: 'ORDER_MAPPING_FAILED', updatedAt: Date.now() },
            ],
            'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data),
            error: JSON.stringify(error, null, 2),
          },
        })
      }
    },
    { pollingIntervals: 100, autoAck: true, maxRunner: 5 },
    true,
  )
}
