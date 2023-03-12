// @flow
import { getTripStatus, getRefOrderTripStatus, getRefOrderStatuses } from './trip.util'
import { TRIP_STATUS } from '../models/trip.repository'
import { TASK_STATUS } from '../models/task.repository'

const taskTypeAcceptTrip = { code: 'ACCEPT_TRIP' }
const taskTypePickup = { code: 'PICKUP' }
const taskTypeDelivery = { code: 'DELIVERY' }
const tasks = [{ status: TASK_STATUS.DONE, taskTypeId: taskTypeAcceptTrip }]

describe('Trip util get trip status', () => {
  it(`getTripStatus should return trip status ${TRIP_STATUS.CANCELLED}`, () => {
    const result = getTripStatus(
      [
        ...tasks,
        { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
        { status: TASK_STATUS.FAILED, taskTypeId: taskTypeDelivery },
      ],
      TRIP_STATUS.CANCELLED,
    )
    expect(result).toBe(TRIP_STATUS.CANCELLED)
  })

  it(`getTripStatus some task delivered, should return trip status ${TRIP_STATUS.PARTIAL_DONE}`, () => {
    const result = getTripStatus(
      [
        ...tasks,
        { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
        { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
        { status: TASK_STATUS.FAILED, taskTypeId: taskTypeDelivery },
      ],
      TRIP_STATUS.CANCELLED,
    )
    expect(result).toBe(TRIP_STATUS.PARTIAL_DONE)
  })

  it(`getTripStatus some task delivered some task cancelled, should return trip status ${TRIP_STATUS.PARTIAL_DONE}`, () => {
    const result = getTripStatus(
      [
        ...tasks,
        { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
        { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
        { status: TASK_STATUS.FAILED, taskTypeId: taskTypeDelivery },
      ],
      TRIP_STATUS.DONE,
    )
    expect(result).toBe(TRIP_STATUS.PARTIAL_DONE)
  })

  it(`getTripStatus all task done, should return trip status ${TRIP_STATUS.DONE}`, () => {
    const result = getTripStatus(
      [
        ...tasks,
        { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
        { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
        { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
      ],
      TRIP_STATUS.DONE,
    )
    expect(result).toBe(TRIP_STATUS.DONE)
  })
})

describe('Trip util get ref order trip status', () => {
  it(`should return trip status ${TRIP_STATUS.CANCELLED}`, () => {
    const result = getRefOrderTripStatus([
      ...tasks,
      { status: TASK_STATUS.CANCELLED, taskTypeId: taskTypePickup },
    ])
    expect(result).toBe(TRIP_STATUS.CANCELLED)
  })

  it(`should return trip status ${TRIP_STATUS.PARTIAL_DONE}`, () => {
    const result = getRefOrderTripStatus([
      ...tasks,
      { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
      { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
      { status: TASK_STATUS.FAILED, taskTypeId: taskTypeDelivery },
    ])
    expect(result).toBe(TRIP_STATUS.PARTIAL_DONE)
  })

  it(`should return trip status ${TRIP_STATUS.DONE}`, () => {
    const result = getRefOrderTripStatus([
      ...tasks,
      { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
      { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
      { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
    ])
    expect(result).toBe(TRIP_STATUS.DONE)
  })

  it(`getRefOrderStatuses should return null`, () => {
    const result = getRefOrderStatuses([
      ...tasks,
      { status: TASK_STATUS.DONE, taskTypeId: taskTypePickup },
      { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
      { status: TASK_STATUS.DONE, taskTypeId: taskTypeDelivery },
    ])
    expect(result).toBeNull()
  })

  it(`getRefOrderStatuses should return null`, () => {
    const result = getRefOrderStatuses(
      [
        ...tasks,
        {
          status: TASK_STATUS.DOING,
          taskTypeId: taskTypePickup,
          information: {
            parcels: [{ refOrderId: 'ODM2009140816307' }],
          },
        },
      ],
      ['ODM2009140816307'],
    )
    expect(result).toEqual([{ refOrderId: 'ODM2009140816307', status: 'DOING' }])
  })
})
