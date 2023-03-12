import R from 'ramda'
import moment from 'moment-timezone'
import priceCalculateUrl from '../services/httpService/priceCalculate'
import passengerRepository from '../models/passengers.repository'
import parcelRepository from '../models/parcel.repository'
import todoRepository from '../models/todo.repository'
import todoTypeRepository from '../models/todoType.repository'
import tripRepository from '../models/trip.repository'
import taskRepository from '../models/task.repository'
import shopRepository from '../models/shop.repository'
import staffRepository from '../models/staff.repository'

import { getGeographyType, getGeographyFlow, getDistanceByGeographyIds } from './geography.util'
import {
  generateTaskId,
  generateTripId,
  checkUpdate,
  findOrCreate,
  findOneWithOutThrow,
  findAndUpdateOrCreate,
  checkDelete,
} from './domain'
import { getTripFlow, getWorkFlow } from './customer.util'

export const requestPriceCalculate = async (body: any) => {
  const respPriceCal = priceCalculateUrl.post({
    thing: `transaction`,
    body,
    headers: null,
  })
  return R.path(['data', 'data'], respPriceCal)
}

export const initStatusTripByExtension = extensionType => {
  const TRIP_STATUS_INIT = {
    TAXI: 'PENDING',
    QRUN: 'PENDING',
    PARCEL: 'PENDING',
  }
  return TRIP_STATUS_INIT[extensionType] || 'PENDING'
}

export const initStatusTaskByExtension = extensionType => {
  const TASK_STATUS_INIT = {
    TAXI: 'TODO',
    QRUN: 'PENDING',
    PARCEL: 'TODO',
  }
  return TASK_STATUS_INIT[extensionType] || 'PENDING'
}

export const getKeyIdsDefault = R.curry(obj => {
  if (R.isNil(obj)) {
    return []
  }
  return R.pluck(['_id'], obj)
})

export const consignmentsValidate = async (consignments: Array) => {
  if (!consignments || !consignments.length) throw new Error('Invalid consigment')
  const { data: parcels } = await parcelRepository.find({ consignment: { $in: consignments } })
  if (!parcels.length) return true
  throw new Error('This consigment sitll process working')
}

export const shopValidate = async (shopCode: String) => {
  const shopCodeParse = +shopCode
  if (Number.isNaN(shopCodeParse)) throw new Error('Invalid shopCode type !')
  const shop = await shopRepository.findOne({ shopCode: shopCodeParse })
  if (!shop) throw new Error('Not Found Shopcode !')
  return shop
}

export const createPassenger = async (data = []) => {
  if (R.isEmpty(data)) throw new Error('Passenger Not Found')
  const newPassengers = data.reduce(async (arr, passenger) => {
    const newArr = await arr
    const newPassenger = await findAndUpdateOrCreate(
      passengerRepository,
      { name: passenger.name },
      passenger,
    )
    newArr.push(newPassenger)
    return newArr
  }, Promise.resolve([]))
  return newPassengers
}

export const createParcel = async data => {
  const { parcels, customer, shopCode, recipientShopCode, extensionFlow } = data
  // await consignmentsValidate(parcels.map(p => p.consignment))
  const workflowTarget = getWorkFlow(customer, extensionFlow)
  let shopCodeObject = {}

  if (R.hasPath(['tripRequired', 'isShop', 'active'], workflowTarget)) {
    const shopData = {}
    if (!shopCode) throw new Error('Not found shopCode !')
    if (shopCode) {
      const validShopCode = await shopValidate(shopCode)
      if (validShopCode) {
        shopData.shopCode = validShopCode
      } else {
        throw new Error('Not found shopCode !')
      }
    }

    if (recipientShopCode) {
      const validShopCode = await shopValidate(recipientShopCode)
      if (validShopCode) {
        shopData.recipientShopCode = validShopCode
      }
    }

    shopCodeObject = {
      ...(shopData && shopData.shopCode && { shopCode: shopData.shopCode._id }),
      ...(shopData &&
        shopData.recipientShopCode && {
          recipientShopCode: shopData.recipientShopCode._id,
        }),
    }
  }

  const newParcels = []
  // eslint-disable-next-line
  for await (const parcel of parcels) {
    const referrences = {
      deliveryStatus: 'PICK_UP',
      referrences: {
        customer: customer._id,
        ...(shopCodeObject && shopCodeObject),
      },
    }

    const newParcel = { ...parcel, ...referrences }
    const newParcelSave = await parcelRepository.upsert(
      { consignment: parcel.consignment },
      { $set: newParcel },
    )
    newParcels.push(newParcelSave)
  }
  return newParcels
}

export const createTodo = async ({ parcels = [], passengers = [], todos = [], deliveryStatus }) => {
  if (R.isEmpty(todos)) throw new Error('Customer todos not found')
  const newTodos = await Promise.all(
    todos.map(async todo => {
      const validTodoType = todo
      const todoCoveter = R.omit(['_id'], validTodoType)
      const newTodo = await todoRepository.create({
        ...todoCoveter,
        deliveryStatus,
        ...(passengers && { passengers }),
        ...(parcels && { parcels }),
        parcels,
        status: 'TODO',
      })
      return newTodo
    }),
  )

  return newTodos
}

export const updateTodo = async (id, data) => await checkUpdate(todoRepository, { _id: id }, data)

export const removeTodo = async todos => {
  await todoRepository.model.remove({ _id: { $in: todos } })
}

export const dataEntryShopValidate = async tasks => {
  const validParcel = R.compose(R.uniq, R.flatten)
  const newParcels = validParcel(tasks.map(v => v.parcels))
  const dataParcels = await Promise.all(
    newParcels.map(async parcel => {
      const getParcel = await parcelRepository.findOne({ _id: parcel })
      return getParcel
    }),
  )
  const finalValid = dataParcels.every(val => {
    const {
      referrences: { parcel },
    } = val
    if (parcel.shopCode && parcel.recipientShopCode) return true
    return false
  })
  return !finalValid
}

export const createTrip = async data => {
  const {
    tasks,
    extensionType,
    customer,
    income,
    staffs = null,
    workflowInstanceId = null,
    workflowType = null,
    workflowTaskId = null,
    payment = null,
  } = data

  let setWindowTimeFromTasks
  if (tasks && tasks.length) {
    setWindowTimeFromTasks = [
      R.head(tasks).windowTime[0],
      tasks.length > 1 ? R.last(tasks).windowTime[0] : R.head(tasks).windowTime[1],
    ]
  }

  const filterGeoType = `search=${JSON.stringify({
    code: extensionType,
  })}`

  const geoTypes = R.indexBy(R.prop('name'), await getGeographyType(filterGeoType))
  const getCalculateDirection = R.ifElse(
    taskList => taskList.length > 1,
    async taskList => {
      const resp = await getDistanceByGeographyIds({
        geographyIds: R.pluck(['geographyId'], taskList),
        geographyType: extensionType,
      })
      return resp
    },
    R.always(null),
  )

  const directions = await getCalculateDirection(tasks)
  /** Get price base cost from 4pl-calculate */
  let respPriceCal = null
  if (payment) {
    const getGeographyFeatures = R.pathOr(null, ['metadata', 'direction', 'features'], directions)
    const getPropertiesCalculate = R.pick(
      ['distance', 'baseTime'],
      R.path(['properties'], R.last(getGeographyFeatures)),
    )
    respPriceCal = await requestPriceCalculate({
      distance: R.path(['distance'], getPropertiesCalculate),
      baseTime: R.path(['baseTime'], getPropertiesCalculate),
      transactionConfigId: R.path(['incentive', 'transactionConfigId'], payment),
      type: R.path(['incentive', 'type'], payment),
    })
  }

  const newTrip = await tripRepository.create({
    tripId: generateTripId(extensionType),
    income,
    windowTime: setWindowTimeFromTasks || [],
    tasks: getKeyIdsDefault(tasks),
    staffs: getKeyIdsDefault(staffs),
    customer: customer._id,
    extensionType,
    status: initStatusTripByExtension(extensionType),
    ...(respPriceCal && {
      priceIncentive: {
        ...respPriceCal.incentive,
        transactionConfigId: respPriceCal.transactionConfigId,
        transactionCostId: respPriceCal.transactionCostId,
      },
    }),
    /** Direcrtion is groupway point for linestrint direction */
    ...(directions && {
      directions: [
        {
          geographyId: directions._id,
          referenceGeographyId: directions.referenceGeographyId,
        },
      ],
    }),
    workflowInstanceId,
    workflowType,
    workflowTaskId,
  })

  if (tasks && tasks.length) {
    await taskRepository.model.update(
      { _id: { $in: tasks.map(task => task._id) } },
      {
        tripId: newTrip._id,
        staffs: (staffs && staffs.map(staff => staff._id)) || [],
        workflowInstanceId,
        workflowType,
        workflowTaskId,
      },
      { multi: true },
    )
  }
  return newTrip
}

export const updateTrip = async ({ customer, tasks }) => {
  const { isShop, cutOffTime, isSameDay } = await getTripFlow({ customer, extensionType: 'parcel' })
  if (isSameDay.active && isShop.active) {
    const validDataEntry = await dataEntryShopValidate(tasks)
    return validDataEntry
  }

  if (cutOffTime.active) {
    const { timeTarget: timeTargetAfter } = isAfterCutOffTime(cutOffTime.time)
    const { timeTarget: timeTargetBefore } = isBeforeCutOffTime(cutOffTime.time)
    if (timeTargetAfter) {
      const findTrip = await Promise.all(
        tasks.map(async task => await tripRepository.findOne({ tasks: { $in: [task._id] } })),
      )
      return !findTrip.some(val => val == null)
    }

    if (timeTargetBefore) {
      const findTrip = await Promise.all(
        tasks.map(async task => await tripRepository.findOne({ tasks: { $in: [task._id] } })),
      )
      return !findTrip.some(val => val == null)
    }
  }
}

/* For create task from system others  */
export const createTask = async (data: any) => {
  const {
    geographyId = {}, //  geographyId will have value when createTask take exceute from conductor flow
    sequenceSystem,
    order,
    parcels = null,
    todos,
    customer,
    extensionFlow,
    passengers = null,
    staffs = null,
  } = data
  const { tripRequired } = extensionFlow
  // get tripRequired condition
  if (tripRequired.cutOffTime.active) {
    const findTaskCurrent = await updateTaskCutOffTime({
      cutOffTime: tripRequired.cutOffTime,
      customer,
      parcels,
      deliveryStatus: order.type,
    })
    if (findTaskCurrent) {
      await Promise.all(
        findTaskCurrent.todos.map(async todo => {
          const tempTodo = await updateParcelsToTodo({ todoId: todo, parcels })
          return tempTodo
        }),
      )
      await removeTodo(todos)
      return findTaskCurrent
    }
  }

  const selectLogicGeographyId = R.curry(({ order, geographyId }) => {
    const fn = R.ifElse(
      val => R.isEmpty(val.geographyId),
      async val => {
        /* In case not geographyId will start query from 4pl-address */
        const filterGeoType = `search=${JSON.stringify({
          code: val.order.extensionType,
        })}`
        /** Logic get geographies from 4pl-address service */
        const addresses = [
          R.pick(['address', 'postcode', 'city', 'lat', 'lng', 'extensionType'], val.order),
        ]
        const geoTypes = R.indexBy(R.prop('name'), await getGeographyType(filterGeoType))
        const geographies = await getGeographyFlow({ data: addresses, geoTypes })
        return R.prop(['geographyId'], R.head(geographies))
      },
      /** In case geographyId from conductor flow  */
      val => val.geographyId,
    )
    return fn({ order, geographyId })
  })

  const getGeographyId = await selectLogicGeographyId({ order, geographyId })
  const newTask = await taskRepository.create({
    ...order,
    sequenceSystem,
    status: initStatusTaskByExtension(order.extensionType),
    ...(getGeographyId && {
      geographyId: getGeographyId._id,
      referenceGeographyId: getGeographyId.referenceGeographyId,
    }),
    taskId: generateTaskId(order.extensionType),
    todos: getKeyIdsDefault(todos),
    parcels: getKeyIdsDefault(parcels),
    passengers: getKeyIdsDefault(passengers),
    staffs: getKeyIdsDefault(staffs),
    deliveryStatus: order.type,
    extensionType: order.extensionType.toUpperCase(),
    customer: customer._id,
  })
  // update taskId for each todo.
  await Promise.all(
    todos.map(async todo => {
      const getTodoUpdate = await updateTodo(todo._id, { taskId: newTask._id })
      return getTodoUpdate
    }),
  )
  return newTask
}

export const isBeforeCutOffTime = cutOffTime => {
  const cutoff = moment(cutOffTime, 'HH:mm')
  const minute = { gt: '01', lt: '00' }
  const gt = moment()
    .tz('Asia/Bangkok')
    .subtract(1, 'day')
    .set({ hour: cutoff.get('hour'), minute: minute.gt })

  const lt = moment()
    .tz('Asia/Bangkok')
    .set({ hour: cutoff.get('hour'), minute: minute.lt })

  const timeBeforeCutOff = moment().isBefore(lt)
  if (timeBeforeCutOff) {
    return { timeTarget: { gt, lt } }
  }
  return { timeTarget: null }
}

export const isAfterCutOffTime = cutOffTime => {
  const cutoff = moment(cutOffTime, 'HH:mm')
  const minute = '01'
  const gt = moment()
    .tz('Asia/Bangkok')
    .set({ hour: cutoff.get('hour'), minute })

  const timeAfterCutOff = moment().isAfter(gt)
  if (timeAfterCutOff) {
    return { timeTarget: gt }
  }
  return { timeTarget: null }
}

export const updateParcelsToTodo = async ({ todoId, parcels }) => {
  const findTodo = await todoRepository.findOne({ _id: todoId })
  if (!findTodo) throw new Error('Not Found Todo on Task !!!')
  const todo = todoRepository.update(
    { _id: findTodo._id },
    { parcels: R.uniq([...findTodo.parcels, ...parcels.map(val => val._id)]) },
  )
  return todo
}

export const updateParcelsToTaskCutOff = async ({ parcels, customer, deliveryStatus, gt, lt }) => {
  const createdAt = {
    ...(gt && { $gt: gt.tz('Etc/GMT+0') }),
    ...(lt && { $lt: lt.tz('Etc/GMT+0') }),
  }
  const task = await taskRepository.model.findOne({
    customer: customer._id,
    deliveryStatus,
    createdAt,
  })
  if (!task) return null
  const taskUpdate = await taskRepository.update(
    { _id: task._id },
    { parcels: R.uniq([...task.parcels, ...parcels.map(val => val._id)]) },
  )
  return taskUpdate
}
export const updateTaskCutOffTime = async ({ cutOffTime, customer, parcels, deliveryStatus }) => {
  if (!cutOffTime.active) throw new Error('cutOffTime Error')
  const { timeTarget: timeTargetAfter } = isAfterCutOffTime(cutOffTime.time)
  if (timeTargetAfter) {
    const task = await updateParcelsToTaskCutOff({
      parcels,
      customer,
      deliveryStatus,
      gt: timeTargetAfter,
      lt: null,
    })
    return task
  }
  const { timeTarget: timeTargetBefore } = isBeforeCutOffTime(cutOffTime.time)
  if (timeTargetBefore) {
    const task = await updateParcelsToTaskCutOff({
      parcels,
      customer,
      deliveryStatus,
      gt: timeTargetBefore.gt,
      lt: timeTargetBefore.lt,
    })
    return task
  }
  return null
}

export const createTodoType = async (data: Array) => {
  const newTodosType = []
  const todoTypeList = data.map(
    async todoType => await findOrCreate(todoTypeRepository, { name: todoType.name }, todoType),
  )
  for await (const todoType of todoTypeList) {
    newTodosType.push(todoType)
  }
  return newTodosType
}

export const findTrip = async list => {
  const trip = await tripRepository.findOne({ _id: { $in: list } })
  return trip
}

export const rollBackRemoveData = async (cacheObjectIDs: any) => {
  if (!R.isEmpty(cacheObjectIDs.todos)) {
    await checkDelete(todoRepository, {
      _id: { $in: cacheObjectIDs.todos },
    })
  }
  if (!R.isEmpty(cacheObjectIDs.trips)) {
    await checkDelete(tripRepository, {
      _id: { $in: cacheObjectIDs.trips },
    })
  }
  if (!R.isEmpty(cacheObjectIDs.tasks)) {
    await checkDelete(taskRepository, {
      _id: { $in: cacheObjectIDs.tasks },
    })
  }
  if (!R.isEmpty(cacheObjectIDs.staffs)) {
    await checkDelete(staffRepository, {
      _id: { $in: cacheObjectIDs.staffs },
    })
  }
}

export const validateStaffId = async (user: any) => {
  const userId = R.path(['userId'], user)
  const staff = await findOneWithOutThrow(staffRepository, { userId })
  return staff._id
}

export const validatePassengerId = async (user: any) => {
  const userId = R.path(['userId'], user)
  const passengerId = await findOneWithOutThrow(passengerRepository, { userId })
  return passengerId._id
}
