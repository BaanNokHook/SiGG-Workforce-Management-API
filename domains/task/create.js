import * as R from 'ramda'
import moment from 'moment'
import taskRepository from '../../models/task.repository'
import { isArrayEmpty, generateTaskId } from '../../utils/domain'
import todoRepository from '../../models/todo.repository'
import extensionFlowRepository from '../../models/extensionFlow.repository'
import createTodoFromExtensionFlow from '../todo/createTodoFromExtensionFlow'
import taskTypeRepository from '../../models/taskType.repository'
// import taskCreatedEvent from './events/taskCreatedEvent'

export default async (data: any, customer: any) => {
  const newTask = data
  const { extensionFlow = null, metadata = {} } = newTask

  const extensionFlowConfig = await extensionFlowRepository.findOne({ name: extensionFlow })
  const taskFlow =
    extensionFlowConfig && R.indexBy(R.prop('deliveryStatus'), extensionFlowConfig.taskRequired)

  if (taskFlow === null && newTask.taskTypeId && !newTask.todos) {
    const taskType = await taskTypeRepository.findOne(
      { _id: newTask.taskTypeId },
      {
        populate: [{ path: 'todoFlowId' }],
      },
    )

    const { todoFlowId } = taskType
    const { flow: todosTemplate } = todoFlowId

    const todoTemplateWithObject =
      typeof todosTemplate.toObject === 'function' ? todosTemplate.toObject() : todosTemplate

    const todosCreated = await todoRepository.create(todoTemplateWithObject)
    newTask.todos = todosCreated
  }

  // Create via workFlow from order OMS
  if (!isArrayEmpty('todos')(data)) {
    newTask.todos = newTask.todos.map((v) => v._id)
    newTask.geographyId = R.path(['geographyId', '_id'], newTask) || newTask.geographyId
    if (R.path(['_id'], customer)) {
      newTask.customer = R.path(['_id'], customer)
    }
  } else {
    // Create new todo, In case "not via oms flow". Function will get extensionFlow by extensionFlow
    const todosExtensionFlow = await Promise.all(
      Object.keys(taskFlow).map(async (type) => {
        const newTodo = await createTodoFromExtensionFlow({ extensionFlow, deliveryStatus: type })
        return newTodo
      }),
    )
    const todos = todosExtensionFlow.reduce((acc, todoExtension) => {
      const newAcc = acc
      const { todos: _todos } = todoExtension
      return [...newAcc, ..._todos]
    }, [])

    newTask.todos = todos.map((todo) => todo._id)
  }

  /** All project ust have taskTypeId */
  if (newTask.taskTypeId) {
    const taskTypeId =
      R.type(newTask.taskTypeId) === 'Object' ? newTask.taskTypeId._id : newTask.taskTypeId
    const taskType = await taskTypeRepository.findOne({ _id: taskTypeId })
    newTask.isRequired = taskType.isRequired
  }
  /** Old extensionFlow config */

  if (R.path([newTask.deliveryStatus, 'isRequired'], taskFlow)) {
    newTask.isRequired = R.pathOr(false, [newTask.deliveryStatus, 'isRequired'], taskFlow)
  }

  newTask.windowTime =
    !newTask.windowTime || R.isEmpty(newTask.windowTime) ? [moment()] : newTask.windowTime // SLA Buffer

  const bodyCreateTask = {
    ...newTask,
    ...(metadata && metadata),
    ...(extensionFlowConfig && {
      ...extensionFlowConfig,
      extensionFlow: extensionFlowConfig._id,
    }),
    taskId: newTask.taskId || generateTaskId(newTask.extensionType),
  }

  const taskFinal = await taskRepository.create(bodyCreateTask)
  await todoRepository.model.updateMany(
    { _id: { $in: newTask.todos } },
    { $set: { taskId: taskFinal._id } },
  )

  // hook event
  //taskCreatedEvent.executeHandlers(taskFinal)

  return taskFinal
}
