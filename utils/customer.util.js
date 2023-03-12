import R from 'ramda'
import customerRepository from '../models/customer.repository'
import { checkFindOne } from './domain'

export const findCustomer = async ({ code, _id }) => {
  const customer = await checkFindOne(customerRepository, { $or: [{ code }, { _id }] }, {})
  return customer
}

type CustomerExtensionFlow = {
  extensionType: string,
  extensionFlow: string,
}

export const findCustomerWorkflow = async ({
  extensionType,
  extensionFlow,
}: CustomerExtensionFlow) => {
  const customer = await checkFindOne(customerRepository, {
    'extensionsFlow.extensionType': extensionType,
    'extensionsFlow.name': extensionFlow,
  })
  return customer
}

export const getTripFlow = ({ customer, extensionType }) => {
  const flowTrip = R.path(['trip'], customer.workflow.extension[extensionType])
  return flowTrip
}

export const getWorkFlow = (customer: object, extensionFlow: string) => {
  const result = R.path(['extensionsFlow'], customer).find(val => val.name === extensionFlow)
  if (!result) throw new Error(`Not found ${customer.code} workflow ${extensionFlow}`)
  return result
}

export const overrideWorkFlow = (extensionFlow: any, todosKey: any) =>
  extensionFlow.map(flow => {
    const newTask = flow.taskRequired.map(f => {
      const overrideTodos = f.todos.map(v => ({
        ...v,
        todoType: todosKey[v.todoType]._id,
      }))
      return { ...f, todos: overrideTodos }
    })
    return { ...flow, taskRequired: newTask }
  })
