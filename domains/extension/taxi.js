import R from 'ramda'
import { getWorkFlow } from '../../utils/customer.util'
import {
  createPassenger,
  createTodo,
  createTask,
  createTrip,
  rollBackRemoveData,
} from '../../utils/extension.util'

export default async (orders, customer) => {
  const newTasks = []
  const cacheObjectIDs = { todos: [], tasks: [], trips: [] }
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const [sequenceSystem, order] of Object.entries(orders)) {
      const { extensionFlow, type, passengers } = order
      const workflowTarget = getWorkFlow(customer, extensionFlow)
      const taskFlow = R.indexBy(R.prop('deliveryStatus'), workflowTarget.taskRequired)
      const newPassengers = await createPassenger(passengers)

      // eslint-disable-next-line no-await-in-loop
      const todos = await createTodo({
        passengers: newPassengers,
        todos: taskFlow[type].todos,
        deliveryStatus: type,
      })
      cacheObjectIDs.todos = [...R.clone(cacheObjectIDs.todos), ...todos.map(({ _id }) => _id)]
      // eslint-disable-next-line no-await-in-loop
      const newTask = await createTask({
        sequenceSystem: +sequenceSystem + 1,
        passengers: newPassengers,
        order,
        customer,
        todos,
        extensionFlow: workflowTarget,
      })
      cacheObjectIDs.tasks = [...R.clone(cacheObjectIDs.tasks), ...[newTask._id]]
      newTasks.push(newTask)
    }

    const trip = await createTrip({
      tasks: newTasks,
      extensionType: 'TAXI',
      //   income: orders.reduce((sum, order) => (sum += order.income), 0),
      customer,
    })

    cacheObjectIDs.trips = [...R.clone(cacheObjectIDs.trips), ...[trip._id]]
    return trip
  } catch (error) {
    console.log('[Error] Taxi Extension :: ', error)
    await rollBackRemoveData(cacheObjectIDs)
    return error
  }
}
