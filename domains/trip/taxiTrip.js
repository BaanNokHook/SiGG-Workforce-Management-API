// @flow
import R from 'ramda'
import debug from 'debug'
import tripRepository from '../../models/trip.repository'
import taskRepository from '../../models/task.repository'
import extensionFlowRepository from '../../models/extensionFlow.repository'
import { getDistanceByGeographyIds } from '../../utils/geography.util'
import { getKeyIdsDefault, generateTripId, checkFind, checkFindOne } from '../../utils/domain'
import { VEHICLE_TYPE } from '../../constants/geography'

const log = debug('app:createTrip')

export type DetailService = {
  fare: number,
  serviceFee: number,
  discount: number,
  coupon: string,
}

export type Incentive = {
  transactionConfigId: string,
  transactionCostId: string,
  type: string,
}
export type OrderPayment = {
  detailService: DetailService,
  incentive: Incentive,
  method: string,
}

type OptionsCreateTrip = {
  extensionType: string,
  extensionFlow: string,
  payment: OrderPayment,
  orderId: string,
  note: string,
  workflowInstanceId: string,
  workflowTaskId: string,
  workflowType: string,
  vehicleType: string,
  type: 'motorcycle' | 'smart-taxi' | 'taxi',
  typeLabel: string,
}

const POPULATE_DEFAULT = [
  { path: 'directions.geographyId' },
  { path: 'customer', select: `code name referenceId` },
  { path: 'staffs' },
  { path: 'tasks', populate: [{ path: 'passengers' }, { path: 'geographyId' }] },
]

const initStatusTripByExtension = (extensionType) => {
  const TRIP_STATUS_INIT = {
    TAXI: 'PENDING',
    QRUN: 'PENDING',
    PARCEL: 'PENDING',
  }
  return TRIP_STATUS_INIT[extensionType] || 'PENDING'
}

const setWindowTimeFromTasks = (tasks) => [
  R.head(tasks).windowTime[0],
  tasks.length > 1 ? R.last(tasks).windowTime[0] : R.head(tasks).windowTime[1],
]

export default async (tasks: Array<string>, options: OptionsCreateTrip) => {
  const getTasks = await checkFind(
    taskRepository,
    { _id: { $in: tasks } },
    { populate: { path: 'geographyId' } },
  )

  const extensionFlowConfig = await checkFindOne(
    extensionFlowRepository,
    { name: options.extensionFlow },
    { populate: { path: 'customer' } },
  )
  /*  Find direction form 4pl-address */
  log(`get:extensionFlowConfig`)

  const vehicleType = R.toUpper(options.vehicleType)

  const getCalculateDirection = R.ifElse(
    (taskList) => taskList.length > 1,
    async (taskList) => {
      const direction = await getDistanceByGeographyIds({
        geographyIds: R.pluck(['geographyId'], taskList),
        geographyType: R.path(['extensionType'], extensionFlowConfig),
        engine: vehicleType === VEHICLE_TYPE.MOTORCYCLE ? 'OSRM' : 'GOOGLE',
        vehicleType,
      })
      return direction
    },
    R.always(null),
  )

  const taskListSorted = R.sortWith([R.ascend(R.prop('sequenceSystem'))])(getTasks)
  const directions = await getCalculateDirection(taskListSorted)

  const metadataExtensionFlow = R.pick(
    [
      'extensionType',
      'companyId',
      'projectId',
      'referenceProjectId',
      'referenceCompanyId',
      'customer',
    ],
    extensionFlowConfig,
  )

  const prepareTripCreate = {
    ...options,
    ...metadataExtensionFlow,
    tripId: generateTripId(options.extensionType),
    windowTime: setWindowTimeFromTasks(taskListSorted) || [],
    tasks: getKeyIdsDefault(getTasks),
    customer: R.path(['customer', '_id'], extensionFlowConfig),
    extensionType: options.extensionType,
    passengers: R.uniq(R.pluck('passengers')(getTasks).flatten()) || [],
    status: initStatusTripByExtension(options.extensionType),
    directions: [
      { geographyId: directions._id, referenceGeographyId: directions.referenceGeographyId },
    ],
    payment: {
      ...options.payment,
      coupon: R.path(['detailService', 'coupon'], options.payment),
    },
    metadata: {
      orderType: options.type,
      typeLabel: options.typeLabel,
    },
  }

  const newTrip = await tripRepository.create(prepareTripCreate)

  await taskRepository.model.update(
    { _id: { $in: tasks } },
    { tripId: newTrip._id, ...R.omit(['extensionFlow'], options) },
    { multi: true },
  )

  const getTripPopulate = await checkFindOne(
    tripRepository,
    { _id: newTrip._id },
    { populate: POPULATE_DEFAULT },
  )
  return getTripPopulate
}
