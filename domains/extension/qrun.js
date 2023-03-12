import R from 'ramda'
import debug from 'debug'
import createTodoFromExtensionFlow from '../todo/createTodoFromExtensionFlow'
import createTask from '../task/create'
import Throw from '../../error/basic'
import createTrip from '../trip/taxiTrip'
import geographyRepository from '../../models/geography.repository'

const log = debug('app:extension:wfm')


export default async orders => {
  log('mapping base_model')
  const tasksFromOrder = R.pathOr([], ['tasks'], orders)
  const tasks = tasksFromOrder.map((task, sequenceSystem) => ({
    ...task,
    sequenceSystem: sequenceSystem + 1,
    deliveryStatus: task.direction,
    geographyId: task.address,
    extensionFlow: R.pathOr(null, ['extensionFlow'], orders),
    extensionType: R.pathOr(null, ['extensionType'], orders),
    orderId: R.pathOr(null, ['orderId'], orders),
    projectId: R.pathOr(null, ['projectId'], orders),
    companyId: R.pathOr(null, ['companyId'], orders),
  }))

  log('start upsert geography from 4pl-address-zoning')
  const geographies = R.pluck('geographyId')(tasks)
  try {
    await geographyRepository.bulkUpsert(['_id'], geographies)
  } catch (error) {
    throw Throw.BULK_WRITE_FAILED({
      message: `Cannot create geographies via bulk write process`,
    })
  }
  log('success upsert geography from 4pl-address-zoning')

  const taskWithTodosByExtensionFlow = await Promise.all(
    tasks.map(async (task, sequenceSystem) => {
      const { metadata, todos } = await createTodoFromExtensionFlow({
        ...task,
      })
      return {
        ...task,
        metadata,
        sequenceSystem: sequenceSystem + 1,
        todos,
        customer: metadata.customer,
        extensionFlow: metadata.metadata,
      }
    }),
  )

  log('Create todo by extension completed')
  const tasksFromDB = await Promise.all(
    R.map(async task => {
      const taskSaveDB = await createTask(
        {
          ...task,
          extensionType: orders.extensionType,
          extensionFlow: orders.extensionFlow,
          status: 'PENDING',
        },
        task.customer,
      )
      return taskSaveDB
    }, taskWithTodosByExtensionFlow),
  )

  log('Create task completed')
  const metadataForTrip = {
    ...R.pick(['extensionType', 'extensionFlow', 'payment', 'orderId', 'note'], orders),
  }

  const newTrip = await createTrip(tasksFromDB, metadataForTrip)
  log('Create Trip completed')

  return newTrip
}
