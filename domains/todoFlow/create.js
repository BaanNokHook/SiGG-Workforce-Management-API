import todoFlowRepository from '../../models/todoFlow.repository'

export default async (data = {}) => {
  const newTodoFlow = await todoFlowRepository.create({
    ...data,
  })
  return newTodoFlow
}
