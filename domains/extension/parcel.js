import R from 'ramda'
import {
  createTodo,
  createTask,
  createTrip,
  createParcel,
  findTrip,
} from '../../utils/extension.util'
import { getWorkFlow } from '../../utils/customer.util'

export default async (orders, customer) => {
  const newTasks = []
  let trip = {}
  // eslint-disable-next-line no-restricted-syntax
  for (const [sequenceSystem, order] of Object.entries(orders)) {
    const { extensionFlow, type } = order
    // eslint-disable-next-line no-await-in-loop
    const newParcels = await createParcel({
      parcels: order.parcels,
      customer,
      shopCode: order.shopCode || '',
      recipientShopCode: order.recipientShopCode || '',
      extensionFlow: order.extensionFlow,
    })

    const workflowTarget = getWorkFlow(customer, extensionFlow)
    const taskFlow = R.indexBy(R.prop('deliveryStatus'), workflowTarget.taskRequired)
    // eslint-disable-next-line no-await-in-loop
    const todos = await createTodo({
      todos: taskFlow[type].todos,
      deliveryStatus: type,
      parcels: newParcels.map(val => val._id),
    })

    // eslint-disable-next-line no-await-in-loop
    const newTask = await createTask({
      sequenceSystem: +sequenceSystem + 1,
      order,
      parcels: newParcels,
      customer,
      todos,
      extensionFlow: workflowTarget,
    })
    newTasks.push(newTask)
  }

  // if tasks no tripId will createTrip ( CUT_OFF_TIME )
  if (newTasks.every(task => task && task.tripId)) {
    trip = await findTrip(newTasks.map(val => val.tripId))
  } else {
    trip = await createTrip({ tasks: newTasks, extensionType: 'PARCEL', customer })
  }

  return trip
}
