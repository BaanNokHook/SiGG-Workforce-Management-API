import geographyRepository from '../../models/geography.repository'
import tripRepository from '../../models/trip.repository'
import addressHttpService from '../../services/httpService/address'
import updateDirection from './updateDirection'
import {
  mockResponseGetDirectionFrom4plAddress,
  mockTripData,
  mockTripDataCaseFailLatLngZeroNumber,
  mockTripDataCaseFailTasksEmpty,
  mockTripDataUpdated,
} from './updateDirection.mock'

jest.mock('../../services/httpService/address')
jest.mock('../../models/trip.repository', () => {
  return {
    findOne: jest.fn(),
    update: jest.fn(),
  }
})
jest.mock('../../models/geography.repository', () => {
  return {
    create: jest.fn(),
  }
})

describe('updateDirection domain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should update direction successfully', async () => {
    const tripId = 'trip-test-1'
    const data = {
      coordinates: [13.0, 100.0],
      vehicleType: 'CAR',
      geographyTypeId: 'test-geography-type-id',
    }

    tripRepository.findOne.mockResolvedValueOnce(mockTripData)
    tripRepository.update.mockResolvedValueOnce(mockTripDataUpdated)
    geographyRepository.create.mockResolvedValueOnce({})
    addressHttpService.request.mockResolvedValueOnce(mockResponseGetDirectionFrom4plAddress)

    await updateDirection(tripId, data)

    expect(tripRepository.findOne).toHaveBeenCalledTimes(1)
    expect(tripRepository.update).toHaveBeenCalledTimes(1)
    expect(geographyRepository.create).toHaveBeenCalledTimes(1)
    expect(addressHttpService.request).toHaveBeenCalledTimes(1)
  })

  test(`should throw error "ValidateError" when latitude or longitude equal zero number`, async () => {
    const tripId = 'trip-test-1'
    const data = {
      coordinates: [13.0, 100.0],
      vehicleType: 'CAR',
      geographyTypeId: 'test-geography-type-id',
    }

    tripRepository.findOne.mockResolvedValueOnce(mockTripDataCaseFailLatLngZeroNumber)
    await expect(updateDirection(tripId, data)).rejects.toThrowError(
      /invalid points has lat and lng equal zero number/i,
    )
  })

  test(`should throw error "NotFound" when not found task within trip`, async () => {
    const tripId = 'trip-test-1'
    const data = {
      coordinates: [13.0, 100.0],
      vehicleType: 'CAR',
      geographyTypeId: 'test-geography-type-id',
    }

    tripRepository.findOne.mockResolvedValueOnce(mockTripDataCaseFailTasksEmpty)
    await expect(updateDirection(tripId, data)).rejects.toThrowError(
      /not found task within tripid/i,
    )
  })

  test(`should throw error when fail to request 4pl-address-and-zoning service`, async () => {
    const tripId = 'trip-test-1'
    const data = {
      coordinates: [13.0, 100.0],
      vehicleType: 'CAR',
      geographyTypeId: 'test-geography-type-id',
    }

    tripRepository.findOne.mockResolvedValueOnce(mockTripData)
    addressHttpService.request.mockRejectedValueOnce(new Error('Fail to service'))
    await expect(updateDirection(tripId, data)).rejects.toThrowError()
  })
})
