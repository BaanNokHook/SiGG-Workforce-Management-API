import * as moment from 'moment-timezone';
import { ITimeSlot } from './shift';
import { IWorkScheduleHoliday } from '../../../domains/preProcessOptimize/type';

export interface IWorkSchedule {
  actualTime: Date[];
  status: string;
  windowTime: string[];
  taskIds: string[];
  metadata?: any;
  deleted: boolean;
  _id: string;
  companyId: string;
  projectId: string;
  staffId: string;
  userId: string;
  tripId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDictStaffWithWorkSchedules {
  [key: string]: IWorkSchedule[];
}

export function convertWorkSchedulesToDictStaffWithWorkSchedules(
  workSchedules: IWorkSchedule[],
): IDictStaffWithWorkSchedules {
  let dict: IDictStaffWithWorkSchedules = {};
  for (const workSchedule of workSchedules) {
    if (!dict[workSchedule.staffId]) {
      dict[workSchedule.staffId] = [] as IWorkSchedule[];
    }

    dict[workSchedule.staffId].push(workSchedule);
  }

  return dict;
}

export function isStartTimeAndEndTimeAreEqual(
  timeSlotStartTime: string,
  timeSlotEndTime: string,
  workScheduleStartTime: string,
  workScheduleEndTime: string,
): boolean {
  // convert to GMT
  let dstStartTime = moment
    .tz(workScheduleStartTime, 'Asia/Bangkok')
    .format('HH:mm');
  let dstEndTime = moment
    .tz(workScheduleEndTime, 'Asia/Bangkok')
    .format('HH:mm');

  // Not support case compare other day
  if (timeSlotStartTime < dstEndTime && timeSlotEndTime > dstStartTime) {
    return true;
  }

  return false;
}

export function getTimeSlotsWithoutTimeCollisionWorkSchedules(
  timeslots: ITimeSlot[],
  workSchedules: IWorkScheduleHoliday[],
): ITimeSlot[] {
  if (workSchedules.length === 0) {
    return timeslots;
  }

  let result: ITimeSlot[] = [];

  for (const timeslot of timeslots) {
    let isTimeCollision = false;
    for (const workSchedule of workSchedules) {
      if (
        isStartTimeAndEndTimeAreEqual(
          timeslot.from,
          timeslot.to,
          workSchedule.windowTime[0],
          workSchedule.windowTime[1],
        )
      ) {
        isTimeCollision = true;
        break;
      }
    }

    if (!isTimeCollision) {
      result.push(timeslot);
    }
  }

  return result;
}
