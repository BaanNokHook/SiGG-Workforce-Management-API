import R from 'ramda'
import { startJaegerSpan } from 'tel-monitoring-kit'
import moment from 'moment'
import ThrowError from '../../error/basic'
import {
  POPULATE_DEFAULT_TODO,
  TodoStatus,
  ResponseStatusMessage,
} from '../../constants/todoUpdate'
import { respUpdateTodo as mapRespUpdateTodo } from '../../respData/todo'
import todoRepository from '../../models/todo.repository'
import { checkUpdate, checkFindOne, genResponseMessageForTodo } from '../../utils/domain'
import { uploadTodoType } from './uploadTodoType'
import flowUpdateByConfig from './flowUpdateByConfig'
import logger from '../../libraries/logger'
import updateTodoEvent from './events/updateTodoEvent'
import { checkSameStaffInTodo } from './wfmSccd'
/** flowUpdateStatus
 * Handle status of task , trip by check from flags status on field of todo
 * When todo  lasted of task will update status of trip = "DONE"
 */

export default async (filter: any, data: any, ctx: any) => {
  const ctxSpan = startJaegerSpan('UPDATE_TODO')
  const todoId = filter._id
  let prepareTodoData = null
  let updateData = { ...data }
  ctxSpan.setTag('todoId', todoId)
  ctxSpan.log({ ctxUser: ctx.user })
  ctxSpan.log({ ctxRequest: ctx.request })
  ctxSpan.log({ todoData: data })
  const todoExists = await checkFindOne(todoRepository, filter, POPULATE_DEFAULT_TODO)
  const todo = R.type(todoExists.toObject) === `Function` ? todoExists.toObject() : todoExists

  // Check sccd staff in todo
  await checkSameStaffInTodo(todoExists, todo, ctx)

  ctxSpan.setTag('todoName', R.pathOr(null, ['todoType', 'name'], todo))
  ctxSpan.setTag('taskId', todo.taskId)
  if (todo.isUpload) {
    try {
      prepareTodoData = await uploadTodoType(todoId, {
        ...data,
      })
      // Use status from data that update because we want to update file expire date and remove file not use anymore
      updateData = prepareTodoData
    } catch (error) {
      ctxSpan.setTag('error', true)
      ctxSpan.finish()
      /** ROLLBACK FILE UPLOAD */
      await checkUpdate(todoRepository, filter, {
        $set: { status: TodoStatus.TODO, result: todo.result },
      })
      throw ThrowError.UPDATE_TODO_FAILED({
        message: error.message || `Fail to update expire date of file-service ${todo._id}`,
        ...error,
      })
    }
  }

  const getResponseMessages = R.path(['todoType', 'responseMessages'], todo)

  try {
    logger.info(`Start Update Todo By Config Flow TodoId ${todoId}`)
    const completedAt = updateData.status === 'DONE' ? moment() : null
    const todoUpdatedResp = await checkUpdate(todoRepository, filter, {
      $set: { status: updateData.status, result: updateData.result, completedAt },
    })

    const todoUpdated =
      R.type(todoUpdatedResp.toObject) === `Function` ? todoUpdatedResp.toObject() : todoUpdatedResp

    logger.info({ event: 'UpdateTodo' }, JSON.stringify({ payload: todoUpdatedResp }))
    await flowUpdateByConfig(todoId)
    logger.info(`Successfully Update Todo By Config Flow TodoId ${todoId}`)
    const ResponseMessageSuccess = genResponseMessageForTodo(getResponseMessages, 'success', todo)

    ctxSpan.finish()
    await updateTodoEvent({ todo, result: updateData.result })
    return mapRespUpdateTodo({ ...todoUpdated, message: ResponseMessageSuccess })
  } catch (error) {
    /** In case error from flowUpdateByConfig */
    const getErrors = R.pathOr(null, ['error', 'message'], error) ? error.error : null
    logger.error(`Failure Update Config Flow TodoId ${todoId}`, error)
    /** ROLLBACK TODO STATUS AND RESULT */
    await checkUpdate(todoRepository, filter, {
      $set: { status: TodoStatus.TODO, result: todo.result, completedAt: null },
    })
    /** We have response template fro todoType for response on mobile */
    const errorResForTodo = genResponseMessageForTodo(
      getResponseMessages,
      ResponseStatusMessage.FAILURE,
      todo,
    )
    throw ThrowError.UPDATE_TODO_FAILED({ ...errorResForTodo, error: getErrors })
  }
}
