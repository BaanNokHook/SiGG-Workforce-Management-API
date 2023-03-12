/* eslint-disable no-restricted-syntax */
import moment from 'moment'
import * as R from 'ramda'
import { fleetApiService } from '../../adapters/restClient/fleet'
import { taskRepo } from '../../models/implementations/taskRepo'

export function matchSkillByTaskType(skills, tasks) {
  const skillSet = new Set(skills.map(({ id }) => id))

  return tasks.map((task) => {
    const taskSkills = R.path(['taskTypeId', 'skills'], task)

    return {
      ...task,
      isSkillMatch: !!taskSkills && taskSkills.every((id) => skillSet.has(id.toString())),
    }
  })
}

export function validateQueueA([taskStart, taskEnd], workSchedules) {
  for (const windowTime of workSchedules) {
    const [start, end] = windowTime

    if (moment(start).isSame(taskStart) || moment(end).isSame(taskEnd)) {
      return false
    }
  }

  return true
}

export function validateQueueR(taskDuration, workSchedules) {
  const workScheduleHour = (date) => moment(date).utc().hours()

  const currentHour = moment().utc().hours()
  const duration = +taskDuration / 60 > 1 ? 1 : +taskDuration / 60
  const [workStart, workEnd] = workSchedules.reduce(
    ([accStart, accEnd], [start, end]) => [
      accStart.add(workScheduleHour(start)),
      accEnd.add(workScheduleHour(end)),
    ],
    [new Set(), new Set()],
  )

  for (let hour = currentHour + 1; hour < 24; hour += duration) {
    if (!workStart.has(hour) && !workEnd.has(hour + duration)) {
      return true
    }
  }

  return false
}

export async function matchWorkSchedules(workSchedules, appointments, tasks) {
  return tasks.map((task) => {
    const { windowTime = [], information } = task
    const { metaInformation = {} } = information
    const { queue } = metaInformation.extraInformation
    if (queue === 'A') {
      return {
        ...task,
        isAvailable: validateQueueA(windowTime, workSchedules),
        isNoAppointment: validateQueueA(windowTime, appointments),
      }
    }

    const standardTimeLength = R.pathOr(
      60,
      ['information', 'metaInformation', 'baseInformation', 'standardTimeLength'],
      task,
    )

    return {
      ...task,
      isAvailable: validateQueueR(standardTimeLength, workSchedules),
      isNoAppointment: validateQueueR(standardTimeLength, appointments),
    }
  })
}

export function matchShift(shifts, tasks) {
  const fixedDate = (date) => moment(date).year(2021).month('January').date(1).utc()

  return tasks.map((task) => {
    const { windowTime } = task
    const [taskStart, taskEnd] = windowTime
    const queue = R.path(['information', 'metaInformation', 'extraInformation', 'queue'], task)
    const isShiftAvailable =
      queue === 'R'
        ? true
        : shifts.some(
            ({ start, end }) =>
              moment(fixedDate(taskStart)).isSameOrAfter(fixedDate(start), 'hour') &&
              moment(fixedDate(taskEnd)).isSameOrBefore(fixedDate(end), 'hour'),
          )

    return {
      ...task,
      isShiftAvailable,
    }
  })
}

export default async function (staffCode, options) {
  const staff = await fleetApiService.getAvailableByStaffCode(staffCode)
  const { data: tasks, ...paginate } = await taskRepo.getUnassignedTasksFromTaskPoolByAreaCode(
    staff.areaCodes,
    options,
  )

  const withSkillMatch = matchSkillByTaskType(staff.skills, tasks)
  const transformedAppointments = staff.appointments.map(({ appointmentFrom, appointmentTo }) => [
    appointmentFrom,
    appointmentTo,
  ])
  const withIsAvailable = await matchWorkSchedules(
    staff.workSchdules,
    transformedAppointments,
    withSkillMatch,
  )
  const withIsShiftAvailable = matchShift(staff.shiftSlots, withIsAvailable)

  return {
    data: withIsShiftAvailable.map(
      ({
        taskId,
        isAvailable,
        windowTime,
        information: {
          queue,
          metaInformation: {
            baseInformation: { standardTimeLength },
          },
        },
        isShiftAvailable,
        isNoAppointment,
        isSkillMatch,
        information: { ticketNo } = {},
      }) => ({
        taskId,
        windowTime,
        ticketNo,
        queue,
        standardTimeLength,
        isAvailable,
        isShiftAvailable,
        isNoAppointment,
        isSkillMatch,
      }),
    ),
    ...paginate,
  }
}
