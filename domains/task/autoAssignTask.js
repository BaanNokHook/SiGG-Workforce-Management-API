// @flow
import moment from 'moment-timezone'
import R from 'ramda'
import type { ITripRepo } from '../../models/implementations/tripRepo'
import { tripRepo } from '../../models/implementations/tripRepo'
import type { ITaskRepo, Task } from '../../models/implementations/taskRepo'
import { taskRepo } from '../../models/implementations/taskRepo'
import type { IOsrmGatewayDomain } from '../address/osrmGatewayDomain'
import { osrmGatewayDomain } from '../address/osrmGatewayDomain'
import logger from '../../libraries/logger'
import type { AssignedTask, IAssignedTaskRepo } from '../../models/implementations/assignedTaskRepo'
import { assignedTaskRepo } from '../../models/implementations/assignedTaskRepo'

export type TimeSlot = {
  start: string,
  end: string,
}

export type Skill = {
  skill: string,
  level: number,
}

type Location = {
  latitude: number,
  longitude: number,
}

type AutoAssignInput = {
  staffId: string,
  dateTime: string,
  shiftSlots: TimeSlot[],
  skills: Skill[],
  areaCodes: string[],
  currentLocation: Location,
  defaultLocation: Location,
  reserveTimes: TimeSlot[],
}

type TravelTime = {
  previousTaskToAssignTask: number,
  assignTaskToNextTask: number,
  workTime: number,
  total: number,
}

type AssignTask = {
  task: string,
  windowTime: TimeSlot[],
  travelTime: TravelTime,
}

type AssignTaskOutput = {
  assignTask: AssignTask,
}

const sortWithStartTime = R.sortWith([R.ascend(R.prop('start'))])

export class AutoAssignDomain {
  tripRepository: ITripRepo
  taskRepository: ITaskRepo
  assignedTaskRepository: IAssignedTaskRepo
  osrmGateway: IOsrmGatewayDomain

  constructor(
    tripRepository: ITripRepo,
    taskRepository: ITaskRepo,
    assignedTaskRepository: IAssignedTaskRepo,
    osrmGateway: IOsrmGatewayDomain,
  ) {
    this.tripRepository = tripRepository
    this.taskRepository = taskRepository
    this.assignedTaskRepository = assignedTaskRepository
    this.osrmGateway = osrmGateway
  }

  async assignTask(staffs: AutoAssignInput[]) {
    const assignTasks = []
    const currentAssignedTasks = []
    let cacheAssignedTasks = []
    const unassignedTasks = new Set()

    logger.info(
      { event: 'AUTO_ASSIGNED_INPUT' },
      JSON.stringify(staffs.map((staff) => staff.staffId)),
    )

    try {
      cacheAssignedTasks = await this.assignedTaskRepository.getAssignedTasks()
    } catch (err) {
      logger.error({
        event: 'AUTO_ASSIGNED_ERROR_GET_CACHE',
        err,
      })
      throw err
    }

    // eslint-disable-next-line no-restricted-syntax
    for await (const staff of staffs) {
      const {
        staffId,
        dateTime,
        shiftSlots,
        areaCodes,
        skills,
        defaultLocation,
        currentLocation,
        reserveTimes = [],
      } = staff
      let shiftSlotsTime = shiftSlots.map((shiftSlot) => ({
        start: this.formatHourMinuteGMT7(shiftSlot.start),
        end: this.formatHourMinuteGMT7(shiftSlot.end),
      }))
      shiftSlotsTime = sortWithStartTime(shiftSlotsTime)

      let todayTrip = {
        _id: '',
        tasks: [],
        windowTime: [],
      }
      let todayTripId = ''
      let todayTasks = []
      try {
        todayTrip = await this.tripRepository.getTripByStaffIdOnCurrentDate(staffId, dateTime, {
          populate: [{ path: 'tasks' }],
        })
      } catch (err) {
        logger.error({
          event: 'AUTO_ASSIGNED_ERROR_TRIP',
          staffId,
          dateTime,
          err,
        })
      }

      let todayTripSlot = []
      let todayTaskSlots = []
      if (todayTrip) {
        todayTripSlot = this.convertTripToTripSlot(todayTrip)
        todayTaskSlots = this.convertTaskToTaskSlots(todayTrip.tasks)
        todayTasks = todayTrip.tasks
        todayTripId = todayTrip._id
      }

      const reserveSlots = reserveTimes.map((d) => ({
        start: this.formatHourMinuteGMT7(d.start),
        end: this.formatHourMinuteGMT7(d.end),
      }))

      const breakSlots = this.convertShiftToBreakSlots(shiftSlotsTime)
      const availableSlotsFromShiftAndTripAndTask = this.convertComposeTimeSlotsToAvailableSlots(
        shiftSlotsTime,
        breakSlots,
        todayTripSlot,
        todayTaskSlots,
      )

      const availableSlots = this.reserveSlotsFromAvailableSlots(
        reserveSlots,
        availableSlotsFromShiftAndTripAndTask,
      )

      let taskPools = []
      try {
        taskPools = await this.taskRepository.getUnassignedTasksFromTaskPool(
          areaCodes,
          this.maximumWorkTime(availableSlots),
          dateTime,
          skills,
          staffId,
        )

        logger.info(
          { event: 'AUTO_ASSIGNED_TASK_POOL', staffId },
          JSON.stringify(taskPools.map((taskPool) => taskPool._id.toString())),
        )
      } catch (err) {
        logger.error({
          event: 'AUTO_ASSIGNED_ERROR_TASK',
          staffId,
          dateTime,
          err,
        })
        // eslint-disable-next-line no-continue
        continue
      }

      const { coordinates, sources, destinations } = this.convertToOsrmQuery(
        defaultLocation,
        currentLocation,
        this.convertToTaskLocation(todayTasks),
        this.convertToTaskPoolsLocation(taskPools),
      )

      let distanceMatrix = []
      try {
        distanceMatrix = await this.osrmGateway.distanceMatrix(coordinates, sources, destinations)
      } catch (err) {
        logger.error({
          event: 'AUTO_ASSIGNED_ERROR_DISTANCE_MATRIX',
          staffId,
          dateTime,
          err,
        })
        // eslint-disable-next-line no-continue
        continue
      }

      const assignTask = this.getAssignTask(
        dateTime,
        todayTasks,
        breakSlots,
        todayTaskSlots,
        availableSlots,
        taskPools,
        distanceMatrix,
        currentAssignedTasks,
        cacheAssignedTasks,
      )

      this.getUnassignedTask(assignTask, taskPools, cacheAssignedTasks).forEach(
        unassignedTasks.add,
        unassignedTasks,
      )

      assignTasks.push({
        staffId,
        dateTime,
        tripId: todayTripId,
        ...assignTask,
      })
    }

    if (currentAssignedTasks.length) {
      const insertCacheAssignedTaskData = currentAssignedTasks.map(
        (currentAssignedTask: string) => ({ taskId: currentAssignedTask }),
      )

      try {
        await this.assignedTaskRepository.createAssignedTasks(insertCacheAssignedTaskData)
      } catch (err) {
        logger.error({
          event: 'AUTO_ASSIGNED_ERROR_CRATE_CACHE',
          err,
        })
        throw err
      }
    }

    logger.info(
      {
        event: 'AUTO_ASSIGNED_SUCCESS',
      },
      JSON.stringify(
        assignTasks.map((assignTask) => ({
          staffId: assignTask.staffId,
          taskId: R.pathOr('', ['assignTask', 'task'], assignTask),
        })),
      ),
    )

    return { assignTasks, unassignedTasks: [...unassignedTasks] }
  }

  getUnassignedTask(assignTask, taskPools, cacheAssignedTasks) {
    const output = []
    const taskPoolNewStatus = taskPools
      .filter((taskPool) => taskPool.status === 'NEW')
      .map((taskPool) => taskPool._id.toString())
      .filter((taskId) => !cacheAssignedTasks.includes(taskId))

    if (R.path(['assignTask', 'task'], assignTask)) {
      const foundUnassignedTasks = taskPoolNewStatus.filter(
        (taskId) => taskId !== assignTask.assignTask.task,
      )

      output.push(...foundUnassignedTasks)
    } else {
      output.push(...taskPoolNewStatus.map((taskPool) => taskPool))
    }

    return output
  }

  reserveSlotsFromAvailableSlots(noAvailableTimeslots, availableSlotsFromShiftAndTrip) {
    const availableSlots = [...availableSlotsFromShiftAndTrip]

    // eslint-disable-next-line no-restricted-syntax
    for (const noAvailableTimeslot of noAvailableTimeslots) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [j, availableSlot] of availableSlots.entries()) {
        // exactly match slot
        if (
          noAvailableTimeslot.start === availableSlot.start &&
          noAvailableTimeslot.end === availableSlot.end
        ) {
          availableSlots.splice(j, 1)
          break
        }

        // left match slot
        if (
          noAvailableTimeslot.start === availableSlot.start &&
          noAvailableTimeslot.end < availableSlot.end
        ) {
          availableSlot.start = noAvailableTimeslot.end
          break
        }

        // middle split slot
        if (
          noAvailableTimeslot.start > availableSlot.start &&
          noAvailableTimeslot.end < availableSlot.end
        ) {
          const hold = availableSlot.end
          availableSlot.end = noAvailableTimeslot.start
          availableSlots.splice(j + 1, 0, {
            start: noAvailableTimeslot.end,
            end: hold,
          })
          break
        }

        // right match slot
        if (
          noAvailableTimeslot.start > availableSlot.start &&
          noAvailableTimeslot.end === availableSlot.end
        ) {
          availableSlot.end = noAvailableTimeslot.start
          break
        }
      }
    }

    return availableSlots
  }

  getAssignTask(
    dateTime: string,
    tasks: Task[],
    breakSlots: TimeSlot[],
    taskSlots: TimeSlot[],
    availableSlots: TimeSlot[],
    taskPools: Task[],
    distanceMatrix: number[][],
    currentAssignedTasks: string[],
    cacheAssignedTasks: AssignedTask[],
  ): AssignTaskOutput {
    const sequenceSlots = sortWithStartTime([
      ...breakSlots.map((breakSlot) => ({
        type: 'break',
        ...breakSlot,
      })),
      ...taskSlots.map((taskSlot, i) => ({
        index: i,
        type: 'task',
        status: tasks[i].status,
        workTime: R.pathOr(
          60,
          ['information', 'metaInformation', 'baseInformation', 'standardTimeLength'],
          tasks[i],
        ),
        ...taskSlot,
      })),
      ...availableSlots.map((availableSlot) => ({
        type: 'available',
        duration: this.calculateDuration(availableSlot),
        ...availableSlot,
      })),
    ])

    const defaultLocationIndex = 0
    const currentLocationIndex = 1
    const firstTaskLocationIndex = 2
    const firstTaskPoolsLocationIndex = firstTaskLocationIndex + tasks.length

    for (let taskIndex = 0; taskIndex < taskPools.length; taskIndex += 1) {
      for (
        let sequenceSlotIndex = 0;
        sequenceSlotIndex < sequenceSlots.length;
        sequenceSlotIndex += 1
      ) {
        // utc compare
        if (
          taskPools[taskIndex].information.metaInformation.extraInformation.queue === 'A' &&
          (taskPools[taskIndex].windowTime.length !== 2 ||
            taskPools[taskIndex].windowTime[1] < dateTime)
        ) {
          // eslint-disable-next-line no-continue
          continue
        }

        if (this.isAvailableTimeAndInCurrentTime(sequenceSlots[sequenceSlotIndex], dateTime)) {
          if (this.notCorrectSlotQA(taskPools[taskIndex], sequenceSlots[sequenceSlotIndex])) {
            // eslint-disable-next-line no-continue
            continue
          }

          const previousTask = this.getPreviousTask(sequenceSlotIndex, sequenceSlots)
          const nextTask = this.getNextTask(sequenceSlotIndex, sequenceSlots)

          const previousTaskLocationIndex = this.getPreviousTaskLocationIndex(
            previousTask,
            defaultLocationIndex,
            currentLocationIndex,
            firstTaskLocationIndex,
          )

          const endDuration = this.getEndDuration(
            nextTask,
            firstTaskLocationIndex,
            distanceMatrix,
            taskIndex,
            firstTaskPoolsLocationIndex,
          )

          // travelTime
          const startDuration =
            distanceMatrix[previousTaskLocationIndex][taskIndex + firstTaskPoolsLocationIndex] / 60
          const workTime =
            taskPools[taskIndex].information.metaInformation.baseInformation.standardTimeLength
          const travelTime = startDuration + workTime + endDuration

          // isInTimeDeadline
          const startTime = this.ceilingHour(
            this.getStartTime(dateTime, sequenceSlots[sequenceSlotIndex]),
          )
          const endTime = moment(startTime, 'HH:mm').add(1, 'hours').format('HH:mm')
          if (moment(endTime, 'HH:mm').hours() === 0) {
            // eslint-disable-next-line no-continue
            continue
          }

          const deadline = this.formatDeadlineTime(taskPools[taskIndex])
          const endTimeFormatDeadline = `${moment(dateTime).utc().format('YYYY-MM-DD')} ${endTime}`
          const isInTimeDeadline = `${endTimeFormatDeadline}` <= deadline

          const taskId = taskPools[taskIndex]._id.toString()
          const matchCurrentAssignedTask = currentAssignedTasks.includes(taskId)
          const matchCacheAssignedTask = cacheAssignedTasks.includes(taskId)

          if (
            endTime <= sequenceSlots[sequenceSlotIndex].end &&
            isInTimeDeadline &&
            !matchCurrentAssignedTask &&
            !matchCacheAssignedTask
          ) {
            currentAssignedTasks.push(taskId)

            const { startWindowTime, endWindowTime } = this.getStartAndEndTime(
              dateTime,
              startTime,
              endTime,
              taskPools[taskIndex],
            )

            const assignTask = {
              assignTask: {
                task: taskId,
                windowTime: {
                  start: startWindowTime,
                  end: endWindowTime,
                },
                travelTime: {
                  previousTaskToAssignTask: startDuration,
                  assignTaskToNextTask: endDuration,
                  workTime,
                  total: travelTime,
                },
              },
            }

            return assignTask
          }
        }
      }
    }

    return {}
  }

  formatDeadlineTime(task) {
    const deadlineDate = moment(task.information.metaInformation.baseInformation.deadline).format(
      'YYYY-MM-DD',
    )
    const deadlineTime = moment(task.information.metaInformation.baseInformation.deadline)
      .add(7, 'hours')
      .format('HH:mm')

    const deadline = `${deadlineDate} ${deadlineTime}`
    return deadline
  }

  getEndDuration(
    nextTask,
    firstTaskLocationIndex,
    distanceMatrix,
    taskIndex,
    firstTaskPoolsLocationIndex,
  ) {
    // select index of location nextTask
    let nextTaskDistanceIndex
    let endDuration
    if (nextTask === undefined || nextTask === 'break') {
      endDuration = -1
    } else {
      nextTaskDistanceIndex = nextTask.index + firstTaskLocationIndex
    }
    if (endDuration === -1 || nextTaskDistanceIndex === undefined) {
      endDuration = 0
    } else {
      endDuration =
        distanceMatrix[taskIndex + firstTaskPoolsLocationIndex][nextTaskDistanceIndex] / 60
    }
    return endDuration
  }

  getPreviousTaskLocationIndex(
    previousTask,
    defaultLocationIndex,
    currentLocationIndex,
    firstTaskLocationIndex,
  ) {
    let previousTaskLocationIndex
    if (previousTask === undefined) {
      previousTaskLocationIndex = defaultLocationIndex
    } else if (previousTask.status === 'DONE' || previousTask === 'break') {
      previousTaskLocationIndex = currentLocationIndex
    } else {
      previousTaskLocationIndex = previousTask.index + firstTaskLocationIndex
    }
    return previousTaskLocationIndex
  }

  notCorrectSlotQA(task, sequenceSlot) {
    return (
      task.information.metaInformation.extraInformation.queue === 'A' &&
      this.notMatchedSlotQA(task, sequenceSlot)
    )
  }

  isAvailableTimeAndInCurrentTime(sequenceSlot, dateTime) {
    return (
      sequenceSlot.type === 'available' && this.formatHourMinuteGMT7(dateTime) < sequenceSlot.end
    )
  }

  getStartAndEndTime(dateTime, startTime, endTime, task) {
    let date = moment(dateTime).utc().format('YYYY-MM-DD')

    const dateTimeHour = moment(dateTime).utc().add(7, 'hours').hours()
    const startTimeHour = moment(startTime, 'HH:mm').hours()
    if (dateTimeHour < 7 && startTimeHour > 6) {
      date = moment(dateTime).utc().add(1, 'days').format('YYYY-MM-DD')
    }

    const QRStart = moment(startTime, 'HH:mm').subtract(7, 'hours').format('HH:mm')
    let startWindowTime = `${date}T${QRStart}:00.000Z`

    const QREnd = moment(endTime, 'HH:mm').subtract(7, 'hours').format('HH:mm')
    let endWindowTime = `${date}T${QREnd}:00.000Z`

    if (task.information.metaInformation.extraInformation.queue === 'A') {
      startWindowTime = `${moment(task.windowTime[0]).utc().toISOString()}`
      endWindowTime = `${moment(task.windowTime[1]).utc().toISOString()}`
    }

    return { startWindowTime, endWindowTime }
  }

  notMatchedSlotQA(task, sequenceSlot) {
    return (
      this.formatHourMinuteGMT7(task.windowTime[0]) < sequenceSlot.start ||
      this.formatHourMinuteGMT7(task.windowTime[1]) > sequenceSlot.end
    )
  }

  getNextTask(i, sequenceSlots) {
    let nextTask
    let k = i
    while (k < sequenceSlots.length) {
      if (sequenceSlots[k].type === 'break') {
        nextTask = 'break'
        break
      }
      if (sequenceSlots[k].type === 'task') {
        nextTask = sequenceSlots[k]
        break
      }
      k += 1
    }
    return nextTask
  }

  getPreviousTask(i, sequenceSlots) {
    let previousTask
    let j = i
    while (j > 0) {
      if (sequenceSlots[j].type === 'break') {
        previousTask = 'break'
        break
      }
      if (sequenceSlots[j].type === 'task') {
        previousTask = sequenceSlots[j]
        break
      }
      j -= 1
    }
    return previousTask
  }

  getStartTime(dateTime, sequenceSlots) {
    if (this.formatHourMinuteGMT7(dateTime) > sequenceSlots.start) {
      return this.formatHourMinuteGMT7(dateTime)
    }
    return sequenceSlots.start
  }

  ceilingHour(time: string): string {
    const minute = Number(time.split(':')[1])
    if (minute === 0) return time
    return moment(time, 'HH:mm').subtract(minute, 'minute').add(1, 'hours').format('HH:mm')
  }

  getAvailableSlotsFromTripAndTask(
    tripSlot: TimeSlot[],
    breakSlots: TimeSlot[],
    taskSlots: TimeSlot[],
  ): TimeSlot[] {
    const breakAndTaskSlots = sortWithStartTime([...breakSlots, ...taskSlots])
    const availableSlotsFromTripAndTask = []
    const lastItem = breakAndTaskSlots.length - 1

    breakAndTaskSlots.forEach((breakAndTaskSlot, i) => {
      if (i === 0 && breakAndTaskSlot.start > tripSlot[0].start) {
        availableSlotsFromTripAndTask.push({
          start: tripSlot[0].start,
          end: breakAndTaskSlot.start,
        })
      }

      if (i === lastItem && breakAndTaskSlot.end < tripSlot[0].end) {
        availableSlotsFromTripAndTask.push({
          start: breakAndTaskSlot.end,
          end: tripSlot[0].end,
        })
      }

      if (i !== lastItem && breakAndTaskSlots[i].end < breakAndTaskSlots[i + 1].start) {
        availableSlotsFromTripAndTask.push({
          start: breakAndTaskSlots[i].end,
          end: breakAndTaskSlots[i + 1].start,
        })
      }
    })

    return availableSlotsFromTripAndTask
  }

  getAvailableSlotsFromShiftAndTrip(shiftSlots: TimeSlot[], tripSlot: TimeSlot[]) {
    const availableSlots = []

    shiftSlots.forEach((shiftSlot) => {
      if (
        (tripSlot[0].start < shiftSlot.start && tripSlot[0].end < shiftSlot.start) ||
        (tripSlot[0].start > shiftSlot.start && tripSlot[0].start > shiftSlot.end)
      ) {
        availableSlots.push({
          start: shiftSlot.start,
          end: shiftSlot.end,
        })
        return
      }

      if (shiftSlot.start < tripSlot[0].start && tripSlot[0].start <= shiftSlot.end) {
        availableSlots.push({
          start: shiftSlot.start,
          end: tripSlot[0].start,
        })
      }

      if (tripSlot[0].end < shiftSlot.end && tripSlot[0].end <= shiftSlot.end) {
        availableSlots.push({
          start: tripSlot[0].end,
          end: shiftSlot.end,
        })
      }
    })

    return availableSlots
  }

  maximumWorkTime(availableSlots) {
    return Math.max(...availableSlots.map((availableSlot) => this.calculateDuration(availableSlot)))
  }

  calculateDuration(availableSlot: TimeSlot): number {
    const startDate = new Date(
      2020,
      1,
      1,
      Number(availableSlot.start.split(':')[0]),
      Number(availableSlot.start.split(':')[1]),
      0,
      0,
    )
    const endDate = new Date(
      2020,
      1,
      1,
      Number(availableSlot.end.split(':')[0]),
      Number(availableSlot.end.split(':')[1]),
      0,
      0,
    )
    return (endDate - startDate) / 1000 / 60
  }

  formatHourMinuteGMT7(value) {
    return moment(value).utc().add(7, 'hours').format('HH:mm')
  }

  convertToTaskPoolsLocation(taskPools) {
    return taskPools.map((taskPool) => [
      Number(taskPool.information.metaInformation.orderBaseInformation.location.latitude),
      Number(taskPool.information.metaInformation.orderBaseInformation.location.longitude),
    ])
  }

  convertToTaskLocation(tasks) {
    return tasks.map((task) => {
      const lat = R.pathOr(
        13.68429,
        ['information', 'metaInformation', 'orderBaseInformation', 'location', 'latitude'],
        task,
      )
      const long = R.pathOr(
        100.61095,
        ['information', 'metaInformation', 'orderBaseInformation', 'location', 'longitude'],
        task,
      )

      return [Number(lat), Number(long)]
    })
  }

  convertComposeTimeSlotsToAvailableSlots(shiftSlots, breakSlots, tripSlot, taskSlots) {
    if (tripSlot.length === 0) {
      return sortWithStartTime(shiftSlots)
    }

    const availableSlotsFromShiftAndTrip = this.getAvailableSlotsFromShiftAndTrip(
      shiftSlots,
      tripSlot,
    )
    const availableSlotsFromTripAndTask = this.getAvailableSlotsFromTripAndTask(
      tripSlot,
      breakSlots,
      taskSlots,
    )
    return sortWithStartTime([...availableSlotsFromShiftAndTrip, ...availableSlotsFromTripAndTask])
  }

  convertTripToTripSlot(todayTrip) {
    if (todayTrip.windowTime.length === 0) return []
    return [
      {
        start: this.formatHourMinuteGMT7(todayTrip.windowTime[0]),
        end: this.formatHourMinuteGMT7(todayTrip.windowTime[1]),
      },
    ]
  }

  convertTaskToTaskSlots(tasks) {
    return tasks.map((task) => ({
      start: this.formatHourMinuteGMT7(task.windowTime[0]),
      end: this.formatHourMinuteGMT7(task.windowTime[1]),
    }))
  }

  convertToOsrmQuery(defaultLocation, currentLocation, tasksLocation, taskPoolsLocation) {
    const coordinates = [
      [defaultLocation.latitude, defaultLocation.longitude],
      [currentLocation.latitude, currentLocation.longitude],
      ...tasksLocation,
      ...taskPoolsLocation,
    ]

    const index = []
    for (let i = 0; i < tasksLocation.length + 2 + taskPoolsLocation.length; i += 1) {
      index.push(i)
    }

    return { coordinates, sources: index, destinations: index }
  }

  convertShiftToBreakSlots(shiftSlots: TimeSlot[]): TimeSlot[] {
    if (shiftSlots.length === 1) return []

    return shiftSlots.reduce((acc, curr, i, arr) => {
      if (arr.length - 1 === i) return acc
      if (arr[i].end !== arr[i + 1].start) {
        acc.push({
          start: arr[i].end,
          end: arr[i + 1].start,
        })
      }
      return acc
    }, [])
  }
}

export const autoAssignDomain = new AutoAssignDomain(
  tripRepo,
  taskRepo,
  assignedTaskRepo,
  osrmGatewayDomain,
)
