// @flow
import logger from '../../libraries/logger/index'
import responseTime from '../../libraries/logger/responseTime'
import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { type ITripRepo, type Trip } from '../../models/implementations/tripRepo'
import { validateData as validateInput } from '../../utils/validate'
import { ValidateError, NotFound } from '../../constants/error'
import { type IWorkflow } from '../../libraries/melonade/melonadeProducer'
import { getTripStatus, getRefOrderStatuses, isTripStatusCompleted } from '../../utils/trip.util'
import { getRefOrderIds, isAllTaskCompleted } from '../../utils/task.util'
import { generateShortUUID } from '../../utils/shortId'
import { TASK_STATUS_COMPLETED } from '../../models/task.repository'
import { TRIP_STATUS } from '../../models/trip.repository'
import R from 'ramda'
import { fleetApiService, IFleetApiService } from '../../adapters/restClient/fleet'
import { STAFF_TYPE } from '../staff/type'
import { validateDateRange } from '../../utils/date.util'
import { type IWeomniWallet } from '../weomni/wallet'
import { roundedDecimals } from '../../utils/domain'
import { buildTags, getLogisticWalletId, getWithdrawalTxRef } from '../../utils/weomni.util'
import updateTripMetadata from './updateMetadata'
import { ICreditWalletAcceptDomain } from '../weomni/creditWalletAccept'

type CancelTask = {
  // mongoId
  tripId: string,
  taskId: string,
  status: 'CANCELLED' | 'FAILED' | 'REJECTED',
  note?: string,
  reason: string,
}

type CancelTrip = {
  // mongoId
  tripId: string,
  status: 'CANCELLED' | 'FAILED' | 'REJECTED',
  note: string,
}

type Cancel = CancelTrip & CancelTask

type CancelWorkflowInputTask = {
  _id: string,
  taskId: string,
}

type CancelWorkflowInput = Cancel & {
  trip: {
    staffs?: string[],
    orderReferenceId: string,
    tripId: string,
  },
  task?: CancelWorkflowInputTask,
}

type InputCreditWallet = {
  amount?: number,
  action?: String,
}

export function buildFilterListActiveTrip(staffId: string) {
  const filter = {
    staffs: { $in: [staffId] },
    status: TRIP_STATUS.DOING,
  }
  const options = {
    populate: [
      {
        path: 'tasks',
        populate: [
          { path: 'geographyId' },
          { path: 'taskTypeId', populate: { path: 'taskTypeGroup' } },
        ],
      },
      { path: 'directions.geographyId' },
    ],
    page: 1,
    limit: 100,
  }

  return {
    filter,
    options,
  }
}

export class TripDomain {
  TripRepository: ITripRepo
  TaskRepository: ITaskRepo
  Workflow: IWorkflow
  FleetApiService: IFleetApiService
  WeomniWallet: IWeomniWallet
  CreditWalletAcceptDomain: ICreditWalletAcceptDomain

  constructor(
    TripRepository: ITripRepo,
    TaskRepository: ITaskRepo,
    Workflow: IWorkflow,
    FleetApiService: IFleetApiService,
    WeomniWallet: IWeomniWallet,
    CreditWalletAcceptDomain: ICreditWalletAcceptDomain,
  ) {
    this.TripRepository = TripRepository
    this.TaskRepository = TaskRepository
    this.Workflow = Workflow
    this.FleetApiService = FleetApiService
    this.WeomniWallet = WeomniWallet
    this.CreditWalletAcceptDomain = CreditWalletAcceptDomain
  }

  async validateTasks(mongoTaskIds: string[]) {
    const isHasTasks = await this.TaskRepository.isHasTasks(mongoTaskIds)
    if (!isHasTasks) {
      throw new ValidateError(`Not allowed to create trip, not have task in system`)
    }

    const isRelatedWithTrip = await this.TaskRepository.isRelatedWithTrip(mongoTaskIds)
    if (isRelatedWithTrip) {
      throw new ValidateError(`Not allowed to create trip, task related with other trip`)
    }
  }

  // eslint-disable-next-line consistent-return
  async create(tripInput: Trip) {
    const { tasks: mongoTaskIds } = tripInput
    validateInput({
      schema: {
        properties: {
          tripId: { type: 'string' },
          tasks: { type: 'array', items: { type: 'string' } },
        },
        required: ['tripId', 'tasks'],
      },
      data: tripInput,
    })

    await this.validateTasks(mongoTaskIds)
    let isCreatedTrip = false
    let tripId = ''
    try {
      const trip = await this.TripRepository.createTrip(tripInput)
      isCreatedTrip = true
      tripId = trip._id
      await this.TaskRepository.bindTripToTask(tripId, mongoTaskIds)
      return trip
    } catch (error) {
      if (isCreatedTrip) {
        await Promise.all([
          this.delete(tripId),
          this.TaskRepository.updateMany({ _id: { $in: mongoTaskIds } }, { tripId: null }),
        ])
      }
      throw error
    }
  }

  // eslint-disable-next-line consistent-return
  async delete(tripId: string) {
    validateInput({
      schema: {
        properties: {
          tripId: { type: 'string' },
        },
        required: ['tripId'],
      },
      data: tripId,
    })
    logger.info([`DELETE TRIP START...]`])
    try {
      const response = await this.TripRepository.deleteTrip(tripId)
      return response
    } catch (error) {
      throw new NotFound(`Trip ${tripId} not found`)
    }
  }

  async removeStaff(tripId: string) {
    validateInput({
      schema: {
        properties: {
          tripId: { type: 'string' },
        },
        required: ['tripId'],
      },
      data: tripId,
    })
    try {
      const response = await this.TripRepository.update(tripId, { staffs: [] })
      await this.TaskRepository.updateMany({ _id: { $in: response.tasks } }, { staffs: [] })
      logger.info({ event: 'REMOVE_STAFF' }, { tripId })
      return response
    } catch (error) {
      logger.error({ event: 'REMOVE_STAFF' }, { tripId }, error)
      throw new NotFound(`Trip ${tripId} not found`)
    }
  }

  // **** cancel task, trip share method ***
  getRefOrderIdsFromTrip(trip: Trip) {
    const refOrderIds = []
    trip.tasks.forEach((task) => {
      const parcels = task.information && task.information.parcels
      if (!parcels) return

      parcels.forEach((parcel) => {
        if (parcel.refOrderId) refOrderIds.push(parcel.refOrderId)
      })
    })
    const uniqueRefOrderIds = [...new Set(refOrderIds)]
    return uniqueRefOrderIds
  }

  getTripDetailStatusMetadata(trip: Trip) {
    const refOrderIds = this.getRefOrderIdsFromTrip(trip)
    const refOrderStatuses = refOrderIds.length
      ? getRefOrderStatuses(trip.tasks, refOrderIds)
      : null
    const detailStatusMetadata = refOrderStatuses ? { refOrderStatuses } : trip.detailStatusMetadata
    return detailStatusMetadata
  }

  getTripDetailStatusMetadataByTaskId(trip: Trip, taskId: string) {
    const task = trip.tasks.find((_task) => String(_task.taskId) === String(taskId))

    if (!task) {
      return trip.detailStatusMetadata
    }

    const { taskTypeId } = task

    const refOrderIds = getRefOrderIds(task)
    const refOrderStatuses = getRefOrderStatuses(trip.tasks, refOrderIds)

    const detailStatusMetadata = refOrderStatuses
      ? { refOrderStatuses, taskId, taskTypeCode: taskTypeId.code }
      : trip.detailStatusMetadata

    return detailStatusMetadata
  }

  getCancelWorkflowName(trip: Trip, cancel: Cancel) {
    const { taskId } = cancel
    if (!taskId) {
      return 'ODM_CANCEL_FAIL_REJECT_TRIP'
    }

    if (taskId && isAllTaskCompleted(trip.tasks)) {
      return 'ODM_CANCEL_FAIL_REJECT_TRIP'
    }

    return 'ODM_CANCEL_FAIL_REJECT_TASK'
  }

  startCancelFailRejectWorkflow(currentTrip: Trip, cancel: Cancel) {
    const workflowRef = {
      name: this.getCancelWorkflowName(currentTrip, cancel),
      rev: '1',
    }

    const { orderId, orderReferenceId, staffs, tripId, tasks } = currentTrip
    const task = tasks.find((_task) => _task.taskId === cancel.taskId)
    const workflowInput: CancelWorkflowInput = {
      trip: {
        orderId,
        staffs,
        orderReferenceId,
        tripId,
      },
      task: task
        ? {
            _id: task._id,
            taskId: task.taskId,
          }
        : undefined,
      ...cancel,
    }
    const workflowTransactionId = `${orderReferenceId}_${generateShortUUID()}_${cancel.status}`

    return this.Workflow.start(workflowTransactionId, workflowRef, workflowInput)
  }

  // **** cancel task ****
  validateInputCancelTask(cancelTask: CancelTask) {
    validateInput({
      schema: {
        properties: {
          tripId: {
            type: 'string',
            minLength: 1,
          },
          taskId: {
            type: 'string',
            minLength: 1,
          },
          status: {
            enum: ['CANCELLED', 'FAILED', 'REJECTED'],
            errorMessage: `should be equal to one of the allowed values 'CANCELLED' 'FAILED' 'REJECTED'`,
          },
          note: {
            type: 'string',
          },
          reason: {
            type: 'string',
            minLength: 1,
          },
        },
        required: ['tripId', 'taskId', 'status', 'reason'],
      },
      data: cancelTask,
    })
  }

  allowedToCancelTask(trip: Trip) {
    if (isTripStatusCompleted(trip.status)) {
      throw new ValidateError('Not allowed to cancel task in trip completed')
    }
  }

  getTripWithTaskDetail(tripId: string) {
    return this.TripRepository.getTripById(tripId, {
      populate: [
        {
          path: 'tasks',
          populate: [
            {
              path: 'taskTypeId',
            },
          ],
        },
      ],
    })
  }

  async updateTripStatus(cancelTask: CancelTask, currentTrip: Trip) {
    const { tripId, taskId } = cancelTask
    const tripStatus = getTripStatus(currentTrip.tasks, cancelTask.status)

    return isAllTaskCompleted(currentTrip.tasks)
      ? // cancel trip
        this.TripRepository.update(tripId, {
          status: tripStatus,
          detailStatus: tripStatus,
          detailStatusMetadata: this.getTripDetailStatusMetadata(currentTrip),
        })
      : // cancel task
        this.TripRepository.update(tripId, {
          detailStatusMetadata: this.getTripDetailStatusMetadataByTaskId(currentTrip, taskId),
        })
  }

  async cancelTask(cancelTask: CancelTask) {
    const { tripId, taskId, note, reason, status } = cancelTask
    const logMetadata = {
      event: 'cancel_task',
      tripId,
      taskId,
    }
    try {
      // validation
      this.validateInputCancelTask(cancelTask)
      const trip = await this.getTripWithTaskDetail(tripId)
      this.allowedToCancelTask(trip)

      // execution
      const updatedTaskStatus = await this.TaskRepository.updateStatusAndStatusMetadata(
        taskId,
        tripId,
        status,
        {
          note,
          reason,
        },
      )

      const currentTrip = await this.getTripWithTaskDetail(tripId)
      const updatedTripStatus = await this.updateTripStatus(cancelTask, currentTrip)

      logger.info(logMetadata, JSON.stringify({ cancelTask, updatedTaskStatus, updatedTripStatus }))

      // $flow-disable-line
      return this.startCancelFailRejectWorkflow(currentTrip, cancelTask)
    } catch (err) {
      logger.error({ ...logMetadata, err }, cancelTask)
      throw err
    }
  }

  // **** cancel trip ****
  validateInputCancelTrip(cancelTrip: CancelTrip) {
    validateInput({
      schema: {
        properties: {
          tripId: {
            type: 'string',
            minLength: 1,
          },
          status: {
            enum: ['CANCELLED', 'FAILED', 'REJECTED'],
            errorMessage: `should be equal to one of the allowed values 'CANCELLED' 'FAILED' 'REJECTED'`,
          },
          note: {
            type: 'string',
            minLength: 1,
          },
        },
        required: ['tripId', 'status', 'note'],
      },
      data: cancelTrip,
    })
  }

  allowedToCancelTrip(trip: Trip) {
    if (isTripStatusCompleted(trip.status)) {
      throw new ValidateError('Not allowed to cancel trip completed')
    }
  }

  validateInputPartTimeEmployeeIncome(staffId: string, startAt: Date, endAt: Date) {
    const data = { staffId, startAt, endAt }
    validateInput({
      schema: {
        type: 'object',
        properties: {
          staffId: {
            type: 'string',
          },
          startAt: {
            format: 'date-time-string',
            type: 'string',
            errorMessage: {
              format: 'startAt wrong format',
            },
          },
          endAt: {
            format: 'date-time-string',
            type: 'string',
            errorMessage: {
              format: 'endAt wrong format',
            },
          },
        },
        required: ['staffId', 'startAt', 'endAt'],
      },
      data,
    })
    validateDateRange(data)
  }

  async updateTripStatusAndTripNote(cancelTrip: CancelTrip, currentTrip: Trip) {
    const { tripId, note } = cancelTrip

    const tripStatus = getTripStatus(currentTrip.tasks, cancelTrip.status)

    return this.TripRepository.update(tripId, {
      status: tripStatus,
      detailStatus: tripStatus,
      detailStatusMetadata: this.getTripDetailStatusMetadata(currentTrip),
      note,
    })
  }

  async cancelTrip(cancelTrip: CancelTrip) {
    const { tripId } = cancelTrip
    const logMetadata = {
      event: 'cancel_trip',
      tripId,
    }
    try {
      // validation
      this.validateInputCancelTrip(cancelTrip)
      const trip = await this.getTripWithTaskDetail(tripId)
      this.allowedToCancelTrip(trip)

      // execution
      const activeTaskMongoIds = trip.tasks
        .filter((task) => !TASK_STATUS_COMPLETED.includes(task.status))
        .map(({ _id }) => _id)
      const updatedTasksStatus = await this.TaskRepository.updateStatusTasks(
        activeTaskMongoIds,
        cancelTrip.status,
      )

      const currentTrip = await this.getTripWithTaskDetail(tripId)
      const updatedTripStatus = await this.updateTripStatusAndTripNote(cancelTrip, currentTrip)

      logger.info(
        logMetadata,
        JSON.stringify({ cancelTrip, updatedTasksStatus, updatedTripStatus }),
      )

      // $flow-disable-line
      return this.startCancelFailRejectWorkflow(currentTrip, cancelTrip)
    } catch (err) {
      logger.error({ ...logMetadata, err }, cancelTrip)
      throw err
    }
  }

  /**
   * @param tripId tripId is mongoId
   * @param taskId if taskId is exists cancelTask if not cancelTrip
   */
  cancel(cancel: Cancel) {
    const { taskId } = cancel

    if (taskId) {
      return this.cancelTask(cancel)
    }

    return this.cancelTrip(cancel)
  }

  async tripActiveList(staffId: string) {
    const logMetadata = {
      event: 'trip_active_list',
      staffId,
      logResponseTimeStart: new Date().getTime(),
    }
    try {
      if (!staffId) throw new ValidateError('staffId is required')

      const { filter, options } = buildFilterListActiveTrip(staffId)
      const trips = await this.TripRepository.list(filter, options)
      logger.info({ ...responseTime(logMetadata), staffId })
      return trips
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async calculatePartTimeEmployeeIncome(staffId: string, startAt, endAt) {
    const logMetadata = {
      event: 'calculate_staff_income',
      staffId,
    }
    try {
      this.validateInputPartTimeEmployeeIncome(staffId, startAt, endAt)
      let totalIncome = 0
      const { type: fleetType } = await this.FleetApiService.getStaff(staffId)

      if (fleetType == STAFF_TYPE.PART_TIME_EMPLOYEE) {
        const trips = await this.TripRepository.getStaffIncome(staffId, startAt, endAt)
        totalIncome = R.pathOr(0, ['total'], trips[0])
      }

      logger.info({ ...logMetadata, staffId })
      return { total: totalIncome }
    } catch (err) {
      logger.error({ err, ...logMetadata })
      throw err
    }
  }

  async releaseCreditWallet(tripId: string, body: InputCreditWallet) {
    const logMetadata = {
      event: 'trip_release_credit_wallet',
      tripId,
      logResponseTimeStart: new Date().getTime(),
    }
    try {
      const trip = await this.TripRepository.getTripById(tripId)
      const { metadata = {}, payment = {} } = trip
      const { weomniTxRef } = metadata
      const { holdWallet } = R.pathOr({}, ['detailService', 'driver'], payment)
      const amount = roundedDecimals(R.pathOr(holdWallet, ['amount'], body), 2)
      const request = {
        txRef: `${weomniTxRef}-release`,
        amount: `${amount}`,
        holdTxRef: `${weomniTxRef}`,
      }

      if (!weomniTxRef) throw new ValidateError('weomniTxRef is empty')
      if (!holdWallet) throw new ValidateError('holdWallet is empty')

      const response = await this.WeomniWallet.release(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))
      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async captureCreditWallet(tripId: string, body: InputCreditWallet) {
    const logMetadata = {
      event: 'trip_capture_credit_wallet',
      tripId,
      logResponseTimeStart: new Date().getTime(),
    }
    try {
      const trip = await this.TripRepository.getTripById(tripId)
      const { metadata = {}, payment = {} } = trip
      const { weomniTxRef } = metadata
      const { holdWallet } = R.pathOr({}, ['detailService', 'driver'], payment)
      const amount = roundedDecimals(R.pathOr(holdWallet, ['amount'], body), 2)
      const request = {
        txRef: `${weomniTxRef}-capture`,
        amount: `${amount}`,
        holdTxRef: `${weomniTxRef}`,
      }

      if (!weomniTxRef) throw new ValidateError('weomniTxRef is empty')
      if (!holdWallet) throw new ValidateError('holdWallet is empty')

      const response = await this.WeomniWallet.capture(request)
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))
      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async withdrawCreditWallet(tripId: string, body: InputCreditWallet) {
    const logMetadata = {
      event: 'trip_withdraw_credit_wallet',
      tripId,
      logResponseTimeStart: new Date().getTime(),
    }
    try {
      const trip = await this.TripRepository.getTripById(tripId)
      const { metadata = {}, payment = {}, staffs } = trip
      const { weomniTxRef, consumerName, orderId, storeName } = metadata
      const { holdWallet } = R.pathOr({}, ['detailService', 'driver'], payment)
      const amount = roundedDecimals(R.pathOr(holdWallet, ['amount'], body), 2)
      const staffId = R.pathOr('', [0], staffs)
      const mode = R.pathOr('', ['mode'], body)

      if (!staffId) throw new ValidateError('staffId is empty')

      const { userId } = await this.FleetApiService.getStaff(staffId)
      const walletId = await this.CreditWalletAcceptDomain.getWalletId(userId)
      const txRef = getWithdrawalTxRef(orderId)

      let request = {
        from: walletId,
        to: getLogisticWalletId(consumerName),
        txRef,
        amount: `${amount}`,
        tags: buildTags(consumerName, storeName),
      }

      if (mode) {
        request = { ...request, mode }
      }

      if (!weomniTxRef) throw new ValidateError('weomniTxRef is empty')
      if (!holdWallet) throw new ValidateError('holdWallet is empty')
      const response = await this.WeomniWallet.withdrawal(request)
      await updateTripMetadata(tripId, { ...metadata, weomniTxRef: txRef })
      logger.info(responseTime(logMetadata), JSON.stringify({ request, response }))
      return response
    } catch (err) {
      logger.error({ err, ...responseTime(logMetadata) })
      throw err
    }
  }

  async actionCreditWallet(tripId: string, body: InputCreditWallet) {
    this.validateInputActionCreditWallet(body)
    const { action } = body

    switch (action) {
      case 'release':
        return await this.releaseCreditWallet(tripId, body)
      case 'capture':
        return await this.captureCreditWallet(tripId, body)
      case 'withdraw':
        return await this.withdrawCreditWallet(tripId, body)
      default:
        throw ValidateError(`${action} not match any actions`)
    }
  }

  validateInputActionCreditWallet(data: InputCreditWallet) {
    validateInput({
      schema: {
        properties: {
          amount: {
            type: 'number',
            minimum: 0,
          },
          action: {
            type: 'string',
            enum: ['release', 'capture', 'withdraw'],
          },
          mode: {
            type: 'string',
            enum: ['HOLD'],
          },
        },
        required: ['action'],
      },
      data,
    })
  }
}
