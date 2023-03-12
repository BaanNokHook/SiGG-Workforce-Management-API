import { GetTripListTodo } from './getTripListTodo'
import { TripRepo } from '../../models/implementations/tripRepo'
import { tripListTodo, trip } from './getTripListTodo.mock'

describe('GetTripListTodo domain', () => {
  const tripRepo = new TripRepo()
  const tripRepoGetTripByIdSpy = jest.spyOn(tripRepo, 'getTripById')
  const getTripListTodo = new GetTripListTodo(tripRepo)

  beforeEach(() => {
    tripRepoGetTripByIdSpy.mockClear()
  })

  it('The consumer should be able to call new() on GetTripListTodo', () => {
    expect(getTripListTodo).toBeTruthy()
  })

  it('Should get all todos in trip specific the trip id', async () => {
    tripRepoGetTripByIdSpy.mockResolvedValue(trip)

    const _tripListTodo = await getTripListTodo.getValue('tripId_111')

    expect(_tripListTodo).toEqual(tripListTodo)
  })

  it('Should throw error message "data/tripId should be string"', async () => {
    function invalidInput() {
      return getTripListTodo.getValue(1)
    }

    await expect(invalidInput()).rejects.toThrowError('data/tripId should be string')
  })
})
