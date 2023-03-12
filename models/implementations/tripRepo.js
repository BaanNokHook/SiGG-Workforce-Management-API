// @flow
import moment from 'moment-timezone'
import TripRepository, { TRIP_STATUS_COMPLETED } from '../trip.repository'
import { NotFound } from '../../constants/error'
import { type IBaseRepository, type Populate } from './type'
// eslint-disable-next-line import/no-cycle
import { type Task } from './taskRepo'
import { TRIP_STATUS } from '../../models/trip.repository'
import Mongoose from 'mongoose'

export type TripStatus =
  | 'PENDING'
  | 'TODO'
  | 'DOING'
  | 'DONE'
  | 'CANCELLED'
  | 'FAILED'
  | 'REJECTED'
  | 'PARTIAL_DONE'

export type WindowTime = [Date, Date | null]

export type Tasks = Task[] & string[]

export type Trip = {
  priceIncentive?: { cost: [] },
  windowTime: WindowTime,
  status: TripStatus,
  passengers?: [],
  staffs?: string[],
  tasks: Tasks,
  rejectRequest?: [],
  income?: number,
  workflowInstanceId?: any,
  workflowTaskId?: any,
  workflowType?: any,
  metadata?: any,
  deleted?: boolean,
  _id: string,
  orderId: string,
  orderReferenceId: string,
  projectId: string,
  companyId: string,
  referenceCompanyId: string,
  referenceProjectId: string,
  tripId: string,
  directions?: string[],
  createdAt?: string,
  updatedAt?: string,
  // taskTypeCode.todoTypeCode
  detailStatus: string,
  detailStatusMetadata: {
    taskId: string,
    todoId: string,
  },
  payment?: any,
}

export type TripsPagination = {
  data: Trip[],
  total: number,
  limit: number,
  page: number,
  hasNext: boolean,
}

export type PaymentUpdate = {
  amount: number,
  method: string,
  extraCODAmount: number,
}

export interface ITripRepo {
  createTrip(tripInput: Trip): Promise<Trip>;
  updateStatus(filter: Object, status: TripStatus): Promise<Trip>;
  update(tripId: string, trip: Trip | Object): Promise<Trip>;
  deleteTrip(tripId: string): Promise<Trip>;
  getTripById(tripId: string, options?: { populate: Populate[] }): Promise<Trip>;
  isHasTrip(tripId: string): Promise<boolean>;
  getTripByStaffIdOnCurrentDate(
    staffId: string,
    date: string,
    options?: { populate: Populate[] },
  ): Promise<Trip>;
  updateDirectionsByTripId(tripId: string, geographyId: string): Promise<Trip>;
  list(filter: any, options?: any): Promise<TripsPagination>;
  getActiveTripByOrderId(orderId: string, options?: { populate: Populate[] }): Promise<Trip>;
  updatePayment(orderId: string, payment: PaymentUpdate): Promise<Trip>;
  getStaffIncome(staffId: string, startAt: string, endAt: string): Promise<Trip>
}

export class TripRepo implements ITripRepo {
  repo: IBaseRepository
  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  createTrip(tripInput: Trip): Promise<Trip> {
    return this.repo.model.findOneAndUpdate({ tasks: { $in: tripInput.tasks } }, tripInput, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    })
  }

  async update(tripId: string, trip: Trip) {
    return this.repo.update({ _id: tripId }, trip)
  }

  async updateStatus(filter: Object, status: TripStatus): Promise<Trip> {
    return this.repo.update(filter, { status })
  }

  deleteTrip(tripId: string): Promise<Trip> {
    return this.repo.update({ _id: tripId }, { deleted: true, deletedAt: new Date() })
  }

  async getTripById(tripId: string, options?: { populate: Populate[] }): Promise<Trip> {
    try {
      const trip = await this.repo.findOne({ _id: tripId }, options)
      if (!trip) {
        throw new NotFound(`trip ${tripId} not found`)
      }
      return trip
    } catch (error) {
      throw error
    }
  }

  async isHasTrip(tripId: string): Promise<boolean> {
    try {
      const trip = await this.repo.findOne({ _id: tripId })
      const isHasTrip = Boolean(trip)
      if (!isHasTrip) {
        throw new NotFound(`trip ${tripId} not found`)
      }
      return isHasTrip
    } catch (error) {
      throw error
    }
  }

  async getTripByStaffIdOnCurrentDate(
    staffId: string,
    dateTime: string,
    options?: { populate: Populate[] },
  ): Promise<Trip> {
    const startTime = moment(dateTime).tz('Asia/Bangkok').startOf('day').utc().toISOString()
    const endTime = moment(dateTime).tz('Asia/Bangkok').endOf('day').utc().toISOString()

    const queryTrip = {
      staffs: staffId,
      'windowTime.0': { $gte: startTime },
      'windowTime.1': { $lte: endTime },
    }

    const trip = await this.repo.findOne(queryTrip, options)
    if (!trip) {
      throw new NotFound(JSON.stringify(queryTrip))
    }

    return trip
  }

  async updateDirectionsByTripId(tripId: string, geographyId: string) {
    return this.repo.update(
      { _id: tripId },
      {
        $push: {
          directions: {
            geographyId,
            referenceGeographyId: geographyId,
          },
        },
      },
    )
  }

  async list(filter: any = {}, options: any = {}): Promise<TripsPagination> {
    return this.repo.find(filter, options)
  }

  async getActiveTripByOrderId(orderId: string, options?: { populate: Populate[] }): Promise<Trip> {
    try {
      const trip = await this.repo.findOne({ 'metadata.orderId': orderId, status: { $nin: TRIP_STATUS_COMPLETED } }, options)
      if (!trip) {
        throw new NotFound(`trip by orderId ${orderId} not found`)
      }
      return trip
    } catch (error) {
      throw error
    }
  }

  async updatePayment(orderId: string, payment: PaymentUpdate): Promise<Trip> {
    const { amount, method, extraCODAmount } = payment

    return await this.repo.update(
      {'metadata.orderId': orderId},
      {
        'payment.amount': amount,
        'payment.method': method,
        'payment.extraCODAmount': extraCODAmount,
      },
    )
  }

  async getStaffIncome(
    staffId: string,
    startAt: string,
    endAt: string,
  ): Promise<Trip> {
    const startTime = new Date(startAt)
    const endTime = new Date(endAt)

    const staffIncomeTotal = await this.repo.aggregate([
      { $match: { status: { $in: [ TRIP_STATUS.DONE, TRIP_STATUS.PARTIAL_DONE ]} } },
      { $match: { updatedAt: { $gte: startTime, $lte: endTime } } },
      { $match: { staffs: { $elemMatch: { $eq: Mongoose.Types.ObjectId(staffId) } } } },
      {
        $group: { _id: "$staffs", total: { $sum: "$payment.detailService.driver.total" }}
      }
    ])

    if (!staffIncomeTotal) {
      throw new NotFound(`get staff income total by staffId ${staffId},startTime ${startAt} and endTime ${endAt} not found`)
    }

    return staffIncomeTotal
  }
}

export const tripRepo = new TripRepo(TripRepository)
