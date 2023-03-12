import R from 'ramda'
import moment from 'moment'
import { META_FLAG_TASK_STATUS, POPULATE_DEFAULT_TODO } from '../../constants/todoUpdate'
import TodoRepository from '../../models/todo.repository'
import { checkFindOne } from '../../utils/domain'
import ThrowError from '../../error/basic'
import startTaskConfig from '../extension/startTaskConfig'
import broadcastTodo from './broadcastTodo'
import conductorTransportTracking from './conductorTransportTracking'
import logger from '../../libraries/logger/index'
import TaskUpdate from '../task/update'
import getResultFromTodoPushToTrip from './getResultFromTodoPushToTrip'
import tripValidateComplete from '../trip/tripValidateComplete'

/**
 *
 * @param todo have featureFlag
 * feature flag i.e. isAccept, isStart, isLast
 */

const isFlagFeatureRejectNull = R.reject(R.isNil)

const isFlagFeatureEnable = R.filter((flagFeature) => {
  const [FlagStatus] = Object.values(flagFeature)
  return FlagStatus
})
const isFlagFeature = R.pipe(
  isFlagFeatureEnable, // output [{ isAccept : true}]
  R.head, // { isAccept : true}
  R.keys, // ["isAccept"]
  R.head, // isAccept
)

const matcherFlagFeature = (todo) => {
  const FlagFeatures = R.keys(todo).map((key) => {
    if (META_FLAG_TASK_STATUS[key]) {
      return { [key]: todo[key] }
    }
    return null
  })
  const FlagFeaturesWithOutNull = isFlagFeatureRejectNull(FlagFeatures)
  return isFlagFeature(FlagFeaturesWithOutNull)
}

export default async function FlowUpdateByConfig(todoId: any) {
  const event = 'FLOW_UPDATE_BY_CONFIG'
  const todoExists = await checkFindOne(TodoRepository, { _id: todoId }, POPULATE_DEFAULT_TODO)
  const todo = R.type(todoExists.toObject) === `Function` ? todoExists.toObject() : todoExists
  const task = R.path(['taskId'], todo)
  const trip = R.path(['taskId', 'tripId'], todo)
  let transportTrackingTodoResp = null
  const flagFeature = matcherFlagFeature(todo)
  const metaFlagTaskStatus = META_FLAG_TASK_STATUS[flagFeature] || {
    status: task.status,
    fields: ['updatedAt'],
  }
  const flagFeatureStatus = metaFlagTaskStatus.status || task.status

  /** This is tracking workflow for Conductor ENGINE
   * In future we have move on to Melonade ENGINE
   * Currently TrueRye still use Conductor ENGINE
   */

  if (todo.isTrackWorkflow) {
    logger.info({ event })
    const { workflowInstanceId, workflowTaskId } = trip
    const isTrackWorkflowConductorEngine = workflowInstanceId && workflowTaskId
    if (isTrackWorkflowConductorEngine) {
      try {
        transportTrackingTodoResp = await conductorTransportTracking(
          workflowInstanceId,
          workflowTaskId,
          `${todo.todoType.name}`,
        )
        logger.info({ event })
        logger.info(
          { event, message: 'Start TrackWorkflow Conductor Engine' },
          JSON.stringify(transportTrackingTodoResp),
        )
      } catch (error) {
        transportTrackingTodoResp = await conductorTransportTracking(
          workflowInstanceId,
          workflowTaskId,
          `${todo.todoType.name} Failure`,
        )
        logger.error({ event, err: error })
        throw ThrowError.NOT_FOUND({
          message: 'Cannot Publish Status Tracking Transport In Conductor Workflow',
        })
      }
    }
  }

  if (todo.isStart) {
    const isStartTask = await startTaskConfig(task._id, todo)
    logger.info({ event, taskId: task._id })
    if (!isStartTask) {
      logger.error({ event, taskId: task._id })
      throw ThrowError.NOT_FOUND({ message: 'Cannot Start to Task' })
    }
  }

  if (todo.isBroadcast) {
    const userGroup = R.pick(['passengers', 'staffs'], trip)
    try {
      await broadcastTodo(userGroup, todo, {})
      logger.info({ event, message: 'success broadcast todo', todoId: todo._id })
    } catch (error) {
      logger.error({ event, message: 'failed broadcast todo', todoId: todo._id })
      throw ThrowError.NOT_FOUND({ message: 'Failure To Send Broadcast' })
    }
  }

  const propsTimeStampFields = metaFlagTaskStatus.fields.reduce(
    (acc, field) => ({ ...acc, [field]: moment() }),
    {},
  )

  /** Prepare data for update task
   *  In case has not workflowInstanceId because not use conductor engine tracking transport
   */
  const prepareTaskUpdate = {
    workflowInstanceId: R.pathOr(null, ['workflowInstanceId'], transportTrackingTodoResp),
    workflowTaskId: R.pathOr(null, ['workflowTaskId'], transportTrackingTodoResp),
    workflowType: R.pathOr(null, ['workflowType'], transportTrackingTodoResp),
    status: flagFeatureStatus,
    ...propsTimeStampFields,
  }

  logger.info({ event, message: 'prepare task data' }, prepareTaskUpdate)
  const todoTypeName = R.path(['todoType', 'name'], todo)
  const taskUpdated = await TaskUpdate(
    { _id: task._id },
    {
      $set: { ...prepareTaskUpdate },
      $push: { track: { todo: todo._id, completedAt: moment(), todoTypeName } },
    },
  )
  logger.info({ event, taskUpdateId: taskUpdated._id })
  const tripMetaFields = getResultFromTodoPushToTrip(todo)

  /** If Task Update status `DONE` then Validate Trip If Task Updated is Task last of Trip  */
  try {
    const tripCompleted = await tripValidateComplete(trip._id, {
      ...tripMetaFields,
      ...R.omit(['completedAt'], prepareTaskUpdate),
    })
    logger.info({ event, message: 'trip updated', tripId: tripCompleted._id })
  } catch (error) {
    logger.error({ event, message: 'trip updated', tripId: trip._id })
    throw ThrowError.UPDATE_TODO_FAILED({ message: 'Failure to Update Flow', ...error })
  }
}
