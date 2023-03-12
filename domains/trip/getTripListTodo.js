// @flow
import R from 'ramda'
import { tripRepo, type ITripRepo, type Trip } from '../../models/implementations/tripRepo'
import { validateData } from '../../utils/validate'
import { type Todo } from '../../models/implementations/todoRepo'

export class GetTripListTodo {
  TripRepository: ITripRepo

  constructor(TripRepository: ITripRepo) {
    this.TripRepository = TripRepository
  }

  async getTrip(tripId: string): Promise<Trip> {
    const populate = [
      {
        path: 'tasks',
        populate: [{ path: 'todos' }],
      },
    ]
    const trip = this.TripRepository.getTripById(tripId, { populate })
    return trip
  }

  getTodos(trip: Trip): Todo[] {
    const { tasks } = trip
    const tripListTodo = tasks.map((task) => task.todos)
    return R.flatten(tripListTodo)
  }

  validateInput(tripId: string) {
    validateData({
      schema: {
        properties: {
          tripId: { type: 'string' },
        },
        required: ['tripId'],
      },
      data: { tripId },
    })
  }

  async getValue(tripId: string): Promise<Todo[]> {
    this.validateInput(tripId)

    const trip = await this.getTrip(tripId)

    const todos = this.getTodos(trip)

    return todos
  }
}

export const getTripListTodo = new GetTripListTodo(tripRepo)
