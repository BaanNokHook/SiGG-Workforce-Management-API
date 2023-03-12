// @flow
import taskUpdatedRascalPublisher from '../../../services/rascal/publishers/taskUpdated.publisher'
import { type Task } from '../../../models/implementations/taskRepo'

export class TaskUpdatedEvent {
  async execute(task: Task) {
    await taskUpdatedRascalPublisher(task)
  }
}
