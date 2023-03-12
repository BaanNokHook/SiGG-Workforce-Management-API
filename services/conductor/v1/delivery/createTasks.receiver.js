import R from 'ramda'
import { startJaegerSpan, FORMAT_TEXT_MAP, injectJaeger } from 'tel-monitoring-kit'
import { conductorClient } from '../../../../libraries/conductor'
import createTodoFromExtensionFlow from '../../../../domains/todo/createTodoFromExtensionFlow'
import createTask from '../../../../domains/task/create'
import graylog from '../../../../utils/graylog.util'
import Throw from '../../../../error/basic'
import geographyRepository from '../../../../models/geography.repository'

const TASK_NAME = 'TRD_TMS_CREATE_TASKS'

export default async () => {
  await conductorClient.registerWatcher(
    TASK_NAME,
    async (data, updater) => {
      console.log(`${TASK_NAME} start`)
      const carrier = { 'uber-trace-id': R.path(['inputData', 'uber-trace-id'], data) }
      const childSpan = startJaegerSpan(TASK_NAME, {
        isChild: { format: FORMAT_TEXT_MAP, injectData: carrier },
      })
      injectJaeger(childSpan, FORMAT_TEXT_MAP, carrier)
      childSpan.setTag('taskName', `${TASK_NAME}`)
      childSpan.setTag('orderId', R.pathOr(null, ['inputData', 'orders', 'orderId'], data))
      childSpan.log({ inputData: data.inputData })

      const _graylog = graylog('SERVICE', 'CONDUCTOR', TASK_NAME, [
        {
          name: 'orderId',
          value: R.pathOr(null, ['inputData', 'orderId'], data),
          logInMessage: true,
        },
        { name: 'taskName', value: TASK_NAME },
        { name: 'taskId', value: R.path(['taskId'], data) },
        { name: 'workflowInstanceId', value: R.path(['workflowInstanceId'], data) },
      ])
      _graylog.info('START')

      try {
        const tasks = R.path(['inputData', 'orders', 'tasks'], data)
        const orderId = R.pathOr(null, ['inputData', 'orderId'], data)
        const statuses = R.pathOr([], ['inputData', 'statuses'], data)
        const { taskId: workflowTaskId, workflowType } = data

        try {
          const geographies = R.pluck('geographyId')(tasks)
          await geographyRepository.bulkUpsert(['_id'], geographies)
        } catch (error) {
          _graylog.error('ERROR.GEOGRAPHY_BULK_WRITE_FAILED', { error })
          throw Throw.BULK_WRITE_FAILED({ message: 'Failure bulk upsert geographies', error })
        }

        const result = await Promise.all(
          await tasks.map(async (task, sequenceSystem) => {
            const { metadata, todos } = await createTodoFromExtensionFlow(task)
            return {
              ...task,
              metadata,
              orderId,
              sequenceSystem: +sequenceSystem + 1,
              workflowInstanceId: R.path(['inputData', 'mainWorkflowInstantId'], data),
              workflowTaskId,
              workflowType,
              todos,
              customer: metadata.customer,
              extensionFlow: metadata.metadata,
            }
          }),
        )

        _graylog.info('INFO.CREATED_TODOS_FROM_EXTENSION_FLOW', { result })

        const resultTasks = await Promise.all(
          result.map(async task => {
            const newTask = await createTask(
              {
                ...task,
                extensionType: R.path(['inputData', 'orders', 'extensionType'], data),
                extensionFlow: R.path(['inputData', 'orders', 'extensionFlow'], data),
              },
              task.customer,
            )
            return newTask._id
          }),
        )

        _graylog.info('INFO.RESULT_TASKS_SUCCESS', { resultTasks })

        const bodyPreSend = {
          orderId,
          orders: R.omit(['tasks'], R.path(['inputData', 'orders'], data)),
          tasks: resultTasks.map(task => task._id),
          statuses: [...statuses, { status: 'ORDER_CREATED_TASKS', updatedAt: Date.now() }],
          'uber-trace-id':
            R.path(['uber-trace-id'], carrier) || R.path(['inputData', 'uber-trace-id'], data),
        }

        await updater.complete({
          outputData: bodyPreSend,
        })
        _graylog.info('COMPLETE.ORDER_CREATED_TASKS', { bodyPreSend })
        childSpan.log({ outputData: bodyPreSend })
        childSpan.finish()
        console.log(`${TASK_NAME} complete`)
      } catch (error) {
        _graylog.error('ERROR.ORDER_CREATED_TASKS_FAILED', null, error)
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
              { status: 'ORDER_CREATED_TASKS_FAILED', updatedAt: Date.now() },
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
