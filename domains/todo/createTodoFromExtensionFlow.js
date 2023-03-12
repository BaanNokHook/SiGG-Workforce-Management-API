import R from 'ramda'
import { checkFindOne } from '../../utils/domain'
import todoRepository from '../../models/todo.repository'
import extensionFlowRepository from '../../models/extensionFlow.repository'

type CreateTodoFromExtensionFlow = {
  extensionType: string,
  extensionFlow: string,
  deliveryStatus: string,
  data: object,
}

type CreateTodo = {
  extensionType: string,
  companyId: string,
  projectId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  customer: string,
  extensionFlow: string,
  address: {},
  passengers: {}[],
  parcels: {}[],
  direction: string,
  note: string,
  geographyId: {},
  referenceGeographyId: string,
  todos: [],
}

const createTodo = async (data: CreateTodo) => {
  if (R.isEmpty(R.pathOr([], ['todos'], data))) {
    throw new Error('Not found todo of extensionFlow')
  }
  const todos = R.pathOr([], ['todos'], data)
  const newTodosFinal = todos.map(todo => {
    const todoRaw = R.type(todo.toObject) === 'Function' ? todo.toObject() : todo
    const todoTypeMetadata = R.omit(['_id', 'title'], R.path(['todoType'], todoRaw))
    const todoMergeObj = {
      ...R.omit(['_id', 'todos', 'direction', 'address'], data),
      status: 'TODO',
      ...R.omit(['_id'], todoRaw),
      ...todoTypeMetadata,
    }

    const todoFinal = R.omit(['createdAt', 'updatedAt'], todoMergeObj)
    return todoFinal
  })

  const respTodos = await todoRepository.create(newTodosFinal)
  return respTodos
}

export default async ({ extensionFlow, deliveryStatus, ...rest }: CreateTodoFromExtensionFlow) => {
  const extensionConfigTask = await checkFindOne(
    extensionFlowRepository,
    { name: extensionFlow },
    { populate: { path: 'taskRequired.todos.todoType' } },
  )

  const getTodosByDeliveryStatus = R.indexBy(
    R.prop('deliveryStatus'),
    extensionConfigTask.taskRequired,
  )

  const metadataTodo = {
    ...R.pick(
      [
        'extensionType',
        'companyId',
        'projectId',
        'referenceProjectId',
        'referenceCompanyId',
        'customer',
      ],
      extensionConfigTask,
    ),
    extensionFlow: extensionConfigTask._id,
  }

  const newTodos = await createTodo({
    ...metadataTodo,
    ...rest,
    todos: getTodosByDeliveryStatus[deliveryStatus].todos,
    deliveryStatus,
  })
  return {
    todos: newTodos,
    metadata: metadataTodo,
  }
}
