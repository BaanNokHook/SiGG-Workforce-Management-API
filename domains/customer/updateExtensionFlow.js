import R from 'ramda'
import {
  isRequiredField,
  findAndUpdateOrCreate,
  checkFindOne,
  checkUpdate,
  isArrayEmpty,
} from '../../utils/domain'
import extensionFlowRepository from '../../models/extensionFlow.repository'
import todoTypeRepository from '../../models/todoType.repository'

const validate = {
  _id: true,
  // referenceProject: true,
  // customer: true,
  // name: true,
  // extensionType: true,
}

export default async (filter: any, data: any) => {
  isRequiredField({ ...filter, ...data }, validate)
  await checkFindOne(extensionFlowRepository, filter)
  const tempValidateTodoType = []
  let isValidateTodoType = null
  if (!isArrayEmpty('taskRequired')(data)) {
    isValidateTodoType = await data.taskRequired.reduce(async (arr, taskByDeliveryStatus) => {
      let newTask = await arr
      const getNewTodos = await R.path(['todos'], taskByDeliveryStatus).reduce(
        async (arrTodoType, todoType) => {
          const newTodoType = await arrTodoType
          const body = {
            title: {
              th: todoType.title,
            },
            name: todoType.todoType,
            description: todoType.note,
            extensionType: data.extensionType,
            customer: data.customer,
            companyId: data.companyId,
            projectId: data.projectId,
            referenceProjectId: data.referenceProjectId,
            referenceCompanyId: data.referenceCompanyId,
            ...(todoType.broadcastPayload && { broadcastPayload: todoType.broadcastPayload }),
            ...(todoType.webViewPayload && { webViewPayload: todoType.webViewPayload }),
            ...(todoType.tripRelate && { tripRelate: todoType.tripRelate }),
          }

          const respTodoType = await findAndUpdateOrCreate(
            todoTypeRepository,
            {
              ...R.pick(
                ['name', 'companyId', 'projectId', 'referenceProjectId', 'referenceCompanyId'],
                body,
              ),
            },
            body,
          )

          newTodoType.push({ ...todoType, todoType: respTodoType._id })
          return newTodoType
        },
        Promise.resolve([]),
      )

      newTask = [...newTask, { ...taskByDeliveryStatus, todos: getNewTodos }]
      tempValidateTodoType.push(getNewTodos.map(v => v.todoType))
      return newTask
    }, Promise.resolve([]))
  }

  const newExtensionFlow = data
  newExtensionFlow.taskRequired = isValidateTodoType
  await todoTypeRepository.model.updateMany(
    { _id: { $in: tempValidateTodoType.flatten() } },
    { $set: { extensionFlow: filter._id } },
  )
  const resp = await checkUpdate(extensionFlowRepository, filter, newExtensionFlow)
  return resp
}
