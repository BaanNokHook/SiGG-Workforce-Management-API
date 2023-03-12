// @flow
import { TaskDomain } from './task'
import { taskRepo } from '../../models/implementations/taskRepo'
import { tripRepo } from '../../models/implementations/tripRepo'

export const taskDomain = new TaskDomain(taskRepo, tripRepo)
