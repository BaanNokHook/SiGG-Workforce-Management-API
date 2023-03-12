// @flow
import R from 'ramda'
import { Types } from 'mongoose'
import taskRepository from '../../models/task.repository'
import tripRepository from '../../models/trip.repository'
import todoRepository from '../../models/todo.repository'
import { checkFindOne, checkFind } from '../../utils/domain'
import config from '../../config'
import { TaskStatus } from '../../constants/task'
import type { Task } from '../../models/implementations/taskRepo'
import type { Todo } from '../../models/implementations/todoRepo'
import logger from '../../libraries/logger'

const castObjectId = Types.ObjectId
const POPULATE = {
  populate: {
    path: 'extensionFlow',
  },
}

/**
 * SINGLE คือ strategy
 *  ในกรณี 1 Trip แล้วจะต้องทำงานหลาย Task โดย usecases ของ WFM
 * Staff จะทำการเดินทางไปที่ จุดหมายได้ครั้งละ 1 จุด เพราะชีวิตจริงไม่สามารถเดินทางไป สองจุดในเวลาเดียวกัน
 * validate มันด้วย  ว่าใน 1 Trip มี task ไหนที่กำลัง DOING อยู่
 * return false = ไม่สามารถทำงานได้
 * return true = คือสามารถทำงานได้
 */
const startTaskByStrategy = {
  SINGLE: async (tripId: string, excludeTaskId: string) => {
    const validStatus = await tripRepository.aggregate([
      { $match: { _id: castObjectId(tripId) } },
      { $lookup: { from: 'tasks', localField: 'tasks', foreignField: '_id', as: '_tasks' } },
      {
        $project: {
          _tasks: {
            $filter: {
              input: '$_tasks',
              as: 'task',
              cond: { $ne: ['$$task._id', castObjectId(excludeTaskId)] },
            },
          },
        },
      },
      { $group: { _id: '$_tasks.status' } },
      { $unwind: '$_id' },
      { $group: { _id: '$_id', count: { $sum: 1 } } },
    ])

    const getCountStatus = R.pathOr(
      null,
      ['count'],
      validStatus.find(status => status._id === 'DOING'),
    )

    return getCountStatus ? !(getCountStatus > 0) : true
  },
  MULTIPLE: async (tripId: string, excludeTaskId: string) => {
    return true
  },
  SEQUENTIAL: async(task: Task): Promise<boolean> => {
    const { sequenceSystem, tripId, _id: taskId } = task
    const prevTasksNotDone = await checkFind(taskRepository, { 
      tripId,
      sequenceSystem: { $lt: sequenceSystem },
      status: { $in: [ TaskStatus.PENDING, TaskStatus.TODO, TaskStatus.DOING ] },
      isRequired: true 
    })

    if (prevTasksNotDone.length > 0) {
      const errorLog = `invalid some previous task is not done. (taskIds: ${prevTasksNotDone
        .map((_task) => _task._id)
        .join(', ')})`

      logger.error(
        {
          event: 'start_task_config',
          strategy: 'SEQUENCE',
          taskId,
          error: errorLog,
        },
        `Fail to start task ${taskId}, ${errorLog} `,
      )
      return false
    }

    return true
  },
  SEQUENTIAL_IN_SAME_ORDER_TYPE: async(task: Task, orderType: string): Promise<boolean> =>{
    const { sequenceSystem, tripId, _id: taskId } = task
    const prevTasksNotDone = await checkFind(taskRepository, { 
      tripId,
      sequenceSystem: { $lt: sequenceSystem },
      status: { $in: [ TaskStatus.PENDING, TaskStatus.TODO, TaskStatus.DOING ] },
      isRequired: true,
      'information.orderType.key': orderType
    })

    if (prevTasksNotDone.length > 0) {
      const errorLog = `invalid some previous task is not done. (taskIds: ${prevTasksNotDone
        .map((_task) => _task._id)
        .join(', ')})`

      logger.error(
        {
          event: 'start_task_config',
          strategy: 'SEQUENCE',
          taskId,
          error: errorLog,
        },
        `Fail to start task ${taskId}, ${errorLog} `,
      )
      return false
    }

    return true
  },
  PRIORITY: async (task: Task, priorities: number[]): Promise<boolean> => {
    const { _id, tripId, priority, sequenceSystem } = task

    const isPriorities = priorities.includes(priority)
    if (isPriorities) {
      return true
    }

    const requireTasks: Task[] = await checkFind(taskRepository, {
      _id: { $ne: _id },
      tripId,
      status: { $in: [TaskStatus.PENDING, TaskStatus.TODO, TaskStatus.DOING] },
      priority: { $nin: priorities },
      sequenceSystem: { $lt: sequenceSystem },
    })

    if (requireTasks.length > 0) {
      const errorLog = `invalid some previous task is not done. (taskIds: ${requireTasks
        .map((task) => task._id)
        .join(', ')})`

      logger.error(
        {
          event: 'start_task_config',
          strategy: 'PRIORITY',
          taskId: _id,
          error: errorLog,
        },
        `Fail to start task ${_id}, ${errorLog} `,
      )
      return false
    }

    return true
  },
}

export default async function (taskId: String) {
  const task = await checkFindOne(taskRepository, { _id: taskId }, POPULATE)

  if (task.projectId.toString() === config.wfm.PROJECT_ID.ASSURANCE) {
    const todo: Todo = await checkFindOne(todoRepository, { taskId, isStart: true })
    const STRATEGY_CONFIG = R.path(['metadata','startTaskStrategy'], todo)
    if (STRATEGY_CONFIG) {
      const orderType = R.path(['information', 'orderType', 'key'], task)
      return startTaskByStrategy[STRATEGY_CONFIG](task, orderType)
    }
    
    const allow_unsequential_tasks_priority = [2,3]
    return startTaskByStrategy.PRIORITY(task, allow_unsequential_tasks_priority)
  }

  const validStrategy = await R.cond([
    [R.equals('SINGLE'), () => startTaskByStrategy.SINGLE(task.tripId, task._id)],
    [R.equals('MULTIPLE'), startTaskByStrategy.MULTIPLE(task.tripId, task._id)],
    [R.T, R.always(false)],
  ])('SINGLE')

  return validStrategy
}
