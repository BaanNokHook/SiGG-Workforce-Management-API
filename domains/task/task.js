// @flow
import logger from '../../libraries/logger/index'
import { type ITaskRepo, type TaskStatus } from '../../models/implementations/taskRepo'
import { validateData as validateInput } from '../../utils/validate'
import { ValidateError } from '../../constants/error'
import { ENUM_TASK_STATUS } from '../../models/task.repository'
import { type ITripRepo } from '../../models/implementations/tripRepo'
import { IWorkflowInputTask, TaskDirection, IParcelType, IPaymentMethod } from './interface'
import { updateManyResponseSerializer } from '../../utils/serializer'
import { flatten } from 'ramda'
import { updateTrip } from '../../utils/extension.util'

type TaskInput = {
  tasks: string | string[],
  status: TaskStatus,
}

type TasksItemsInput = {
  orderId: string,
  tasks: ITasks[],
}

interface ITasks {
  taskId: string;
  taskRefId?: string;
  information: IInformation;
}

interface IInformation {
  parcels: IParcel[];
  payment: IPayment;
}

interface IParcel {
  consignment?: string;
  productId?: string;
  name: string;
  type: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
  unit?: string;
  weight?: number;
  dimension?: any;
  price?: number;
  note?: string;
  payment?: any;
}

interface IPayment {
  method?: string;
  extraCODAmount?: number;
  description?: string;
}

interface IContact {
  contactName?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  contactName2?: string;
  contactPhone2?: string;
  contactMobile2?: string;
  contactEmail2?: string;
}

interface ICustomer {
  custId?: string;
  custName: string;
  custType: string;
  addressDetails?: string;
  contact?: IContact[];
}

interface IServiceOrderAttribute {
  attrCode: string;
  attrName: string;
  value?: string;
  valueDesc?: string;
}

interface IProduct {
  areaCode: string;
  serviceGrade?: string;
  serviceNo: string;
  oldServiceNo?: string;
  servicePassword?: string;
  prodInstld: string;
  accessMode?: string;
  prodSpecCode: string;
  bundleInstName?: string;
  addressDetails?: string;
  addressId?: string;
  contact?: IContact;
  contact2?: IContact;
  prodAttrList?: IProductAttribute[];
  subProdList?: ISubProduct[];
  meshDevice?: IMeshDevice[];
  specialAP?: ISpecialAP[];
}

interface IRelationProductOrder {
  relaType: string;
  releProdOrderNo: string;
}

interface IRelationProduct {
  relaType: string;
  releProdInstld: string;
}

interface IOrderAttribute {
  attrCode: string;
  attrName: string;
  value?: string;
  valueDesc?: string;
}

interface IProductOrder {
  prodOrderNo: string;
  prodEventCode: string;
  product: IProduct;
  relaProdOrderList?: IRelationProductOrder[];
  relaProdList?: IRelationProduct[];
  appointNo?: string;
  appointDate?: string;
  appointTime?: string;
  custRfsDate?: string;
  rfsDate?: string;
  comments?: string;
  ordAttrList?: IOrderAttribute[];
}

interface ITaskInformation {
  createDate: string;
  submitOrgName?: string;
  submitStaffCode?: string;
  submitStaffName?: string;
  customer: ICustomer;
  serviceOrderAttribute: IServiceOrderAttribute[];
  productOrderList: IProductOrder[];
}

function buildProductOrderListNewInfo(oldData: IProductOrder[], newData: IProductOrder[]) {
  const productOrderListInfo = newData.map((element, index) => {
    const currentElement = element
    currentElement.prodOrderNo = oldData[index].prodOrderNo
    currentElement.prodEventCode = oldData[index].prodEventCode
    currentElement.product.serviceNo = oldData[index].product.serviceNo
    currentElement.product.accessMode = oldData[index].product.accessMode
    currentElement.product.prodSpecCode = oldData[index].product.prodSpecCode
    currentElement.product.areaCode = oldData[index].product.areaCode
    return currentElement
  })
  return productOrderListInfo
}

function buildTaskInformationPayload(
  oldInfo: ITaskInformation,
  newInfo: ITaskInformation,
  productOrderList: IProductOrder[],
) {
  return {
    'information.metaInformation.installationInformation.serviceOrderInfo.customer':
      newInfo.customer,
    'information.metaInformation.installationInformation.serviceOrderInfo.productOrderList':
      productOrderList,
    'information.metaInformation.installationInformation.serviceOrderInfo.serviceOrderAttribute':
      oldInfo.serviceOrderAttribute,
  }
}

export class TaskDomain {
  TaskRepository: ITaskRepo
  TripRepository: ITripRepo

  constructor(TaskRepository: ITaskRepo, TripRepository: ITripRepo) {
    this.TaskRepository = TaskRepository
    this.TripRepository = TripRepository
  }

  async validateTask(tasks: string[] | string) {
    const isHasTasks = await this.TaskRepository.isHasTasks(tasks)

    if (!isHasTasks) {
      throw new ValidateError(`Not allowed to update status of task, not have task in system`)
    }
  }

  // eslint-disable-next-line consistent-return
  async updateSingleTaskStatus(taskInput: TaskInput) {
    const { tasks, status } = taskInput
    validateInput({
      schema: {
        properties: {
          tasks: { type: 'string' },
          status: { enum: ENUM_TASK_STATUS },
        },
        required: ['tasks', 'status'],
      },
      data: taskInput,
    })

    await this.validateTask(tasks)
    try {
      const response = await this.TaskRepository.updateStatus(tasks, status)
      logger.info({ event: 'UPDATE_SINGLE_TASK_STATUS' }, taskInput)
      return response
    } catch (err) {
      logger.error({ err, event: 'UPDATE_SINGLE_TASK_STATUS' }, taskInput)
      throw new Error('Update task status failed')
    }
  }

  async updateAllTaskStatus(taskInput: TaskInput) {
    const { tasks, status } = taskInput
    validateInput({
      schema: {
        properties: {
          tasks: { type: 'array', items: { type: 'string' } },
          status: { enum: ENUM_TASK_STATUS },
        },
        required: ['tasks', 'status'],
      },
      data: taskInput,
    })

    await this.validateTask(tasks)
    try {
      const response = await this.TaskRepository.updateMany(
        { _id: { $in: tasks }, status: { $ne: 'DONE' } },
        { status },
      )
      logger.info({ event: 'UPDATE_ALL_TASK_STATUS' }, taskInput)
      return response
    } catch (err) {
      logger.error({ err, event: 'UPDATE_ALL_TASK_STATUS' }, taskInput)
      throw new Error('Update task status failed')
    }
  }

  async updateTaskStatusByOrderId(orderId: string, status: string) {
    try {
      validateInput({
        schema: {
          properties: {
            orderId: { type: 'string' },
            status: { enum: ENUM_TASK_STATUS },
          },
          required: ['orderId', 'status'],
        },
        data: {
          orderId,
          status,
        },
      })

      const response = await this.TaskRepository.update({ orderId }, { status })
      logger.info({ event: 'update_task_by_orderId', orderId, status })
      return response
    } catch (err) {
      logger.error({ err, event: 'update_task_by_orderId', orderId, status })
      throw err
    }
  }

  async updateTaskInformationByOrderId(
    orderId: string,
    orderInfo: ITaskInformation,
    updateOrder: ITaskInformation,
  ) {
    try {
      if (!orderId) {
        throw new ValidateError('orderId is required')
      }

      const oldInfo = orderInfo
      const newInfo = updateOrder

      const productOrderList = buildProductOrderListNewInfo(
        oldInfo.productOrderList,
        newInfo.productOrderList,
      )

      const _taskInformation = buildTaskInformationPayload(oldInfo, newInfo, productOrderList)
      const response = await this.TaskRepository.update(
        { orderId },
        { $set: { ..._taskInformation } },
      )

      logger.info(
        { event: 'update_task_information_by_orderId', orderId },
        { oldData: JSON.stringify(orderInfo), newData: JSON.stringify(updateOrder) },
      )
      return response
    } catch (err) {
      logger.error(
        { err, event: 'update_task_information_by_orderId', orderId },
        { oldData: JSON.stringify(orderInfo), newData: JSON.stringify(updateOrder) },
      )
      throw err
    }
  }

  async updateMultiTaskInformationByOrderId(
    orderId: string,
    orderInfo: ITaskInformation,
    updateOrder: ITaskInformation,
  ) {
    try {
      if (!orderId) {
        throw new ValidateError('orderId is required')
      }

      const oldInfo = orderInfo
      const newInfo = updateOrder

      const productOrderList = buildProductOrderListNewInfo(
        oldInfo.productOrderList,
        newInfo.productOrderList,
      )

      const _taskInformation = buildTaskInformationPayload(oldInfo, newInfo, productOrderList)
      const response = await this.TaskRepository.updateMany(
        { orderId },
        { $set: { ..._taskInformation } },
      )
      logger.info(
        { event: 'update_task_information_by_orderId', orderId },
        { oldData: JSON.stringify(orderInfo), newData: JSON.stringify(updateOrder) },
      )
      return updateManyResponseSerializer(response)
    } catch (err) {
      logger.error(
        { err, event: 'update_task_information_by_orderId', orderId },
        { oldData: JSON.stringify(orderInfo), newData: JSON.stringify(updateOrder) },
      )
      throw err
    }
  }

  async updateTasksItems(inputs: TasksItemsInput) {
    const { orderId, tasks } = inputs

    try {
      this.validateTasksItems(inputs)

      const trip = await this.TripRepository.getActiveTripByOrderId(orderId)
      this.allowUpdateTaskItems(trip.detailStatus)
      const consignment = trip.metadata?.consignment

      const updatedTask = await this.updateTasksParcelAndPayment(tasks)
      await this.updateTripsPayment(orderId, updatedTask)

      logger.info({ event: 'update_tasks_items', orderId }, JSON.stringify({ tasks: tasks }))
      return { orderId, consignment, tasks: updatedTask }
    } catch (err) {
      logger.error({ err, event: 'update_tasks_items', orderId }, JSON.stringify({ tasks: tasks }))
      throw err
    }
  }

  async updateTasksParcelAndPayment(tasks: ITasks[]): Promise<any> {
    return await Promise.all(
      tasks.map(async (task) => {
        return this.TaskRepository.updateParcelsAndPayment(task.taskId, task.information)
      }),
    )
  }

  async updateTripsPayment(orderId: string, tasks: ITasks[]) {
    const deliveryTasks = this.filterDeliveryTasks(tasks)

    if (deliveryTasks.length) {
      const amount = this.getTotalParcelPrice(deliveryTasks)
      const extraCODAmount = this.getTotalExtraCODAmount(deliveryTasks)
      const method = this.getPaymentMethod(deliveryTasks)
      const paymentUpdate = { amount, method, extraCODAmount }
      await this.TripRepository.updatePayment(orderId, paymentUpdate)
    }
  }

  allowUpdateTaskItems(detailStatus: string) {
    const tripStatusesBeforePickedUp = [
      'ACCEPT_TRIP.ACCEPT_TRIP.DOING',
      'ONDEMAND_PICKUP.SET_OFF.DOING',
      'ONDEMAND_PICKUP.CHECK_IN.DOING',
    ]

    if (!tripStatusesBeforePickedUp.includes(detailStatus))
      throw new ValidateError(`trip status: ${detailStatus} is not allow to update task items`)
  }

  validateTasksItems(inputs: any) {
    validateInput({
      schema: {
        properties: {
          orderId: { type: 'string' },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                taskRefId: { type: 'string' },
                information: {
                  type: 'object',
                  properties: {
                    parcels: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          consignment: { type: 'string' },
                          productId: { type: 'string' },
                          name: { type: 'string' },
                          type: {
                            type: 'string',
                            enum: ['PRODUCTS', 'PROMOCODE', 'FEE', 'PAYMENT'],
                          },
                          description: { type: 'string' },
                          imageUrl: { type: 'string' },
                          quantity: { type: 'number' },
                          unit: { type: 'string' },
                          weight: { type: 'number' },
                          dimension: { type: 'object' },
                          price: { type: 'number' },
                          note: { type: 'string' },
                          payment: { type: 'object' },
                        },
                        required: ['name', 'type'],
                      },
                    },
                    payment: {
                      type: 'object',
                      properties: {
                        method: { type: 'string' },
                        description: { type: 'string' },
                        extraCODAmount: { type: 'number' },
                      },
                    },
                  },
                  required: ['parcels', 'payment'],
                },
              },
              required: ['taskId', 'information'],
            },
          },
        },
        required: ['orderId', 'tasks'],
      },
      data: inputs,
    })
  }

  filterDeliveryTasks(tasks: IWorkflowInputTask[]) {
    return tasks.filter((task) => task.deliveryStatus === TaskDirection.DELIVER)
  }

  getTotalParcelPrice(deliveryTasks: IWorkflowInputTask[]) {
    const parcels = deliveryTasks.map((task) => task.information.parcels || [])
    const parcelsFlatten = flatten(parcels)
    const _parcels = parcelsFlatten.filter((parcel) => parcel.type !== IParcelType.PAYMENT)

    return _parcels.reduce((previous, parcel) => {
      const price = parcel.price || 0
      const quantity = parcel.quantity || 1
      return previous + price * quantity
    }, 0)
  }

  getTotalExtraCODAmount(deliveryTasks: IWorkflowInputTask[]) {
    const payments = deliveryTasks.map((task) => task.information.payment || [])
    const paymentsFlatten = flatten(payments)
    return paymentsFlatten.reduce(
      (previous, payment) => previous + (payment.extraCODAmount || 0),
      0,
    )
  }

  getPaymentMethod(deliveryTasks: IWorkflowInputTask[]) {
    const method = deliveryTasks?.[0]?.information?.payment?.method
    return method || IPaymentMethod.PREPAID
  }
}
