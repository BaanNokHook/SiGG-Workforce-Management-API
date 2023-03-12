import R from 'ramda'
import {
  isRequiredField,
  alreadyExistThrowError,
  findAndUpdateOrCreate,
  checkFindOne,
} from '../../utils/domain'
import customerRepository from '../../models/customer.repository'
import todoTypeRepository from '../../models/todoType.repository'
import extensionsFlowRepository from '../../models/extensionFlow.repository'

const validate = {
  referenceProjectId: true,
  customer: true,
  name: true,
  extensionType: true,
}

export default async (data: any) => {
  isRequiredField(data, validate)
  await checkFindOne(customerRepository, { _id: data.customer })
  await alreadyExistThrowError(extensionsFlowRepository, { name: data.name })
  const tempValidateTodoType = []
  const newTaskRequired = await data.taskRequired.reduce(async (arr, taskByDeliveryStatus) => {
    let newTask = await arr
    const getNewTodos = await Promise.all(
      taskByDeliveryStatus.todos.map(async todoType => {
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

        const getTodoTypeId = await findAndUpdateOrCreate(
          todoTypeRepository,
          R.omit(['description', 'title'], body),
          body,
        )

        return { ...todoType, todoType: getTodoTypeId._id }
      }),
    )
    newTask = [...newTask, { ...taskByDeliveryStatus, todos: getNewTodos }]
    tempValidateTodoType.push(getNewTodos.map(v => v.todoType))
    return newTask
  }, Promise.resolve([]))

  const newExtensionFlow = data
  newExtensionFlow.taskRequired = newTaskRequired
  const resp = await extensionsFlowRepository.create(newExtensionFlow)
  await todoTypeRepository.model.updateMany(
    { _id: { $in: tempValidateTodoType.flatten() } },
    { $set: { extensionFlow: resp._id } },
  )
  return resp
}
