import {
  ITask as IMelonadeTask,
  ITaskResponse
} from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { assocPath, clone } from 'ramda';
import { Service } from 'typedi';
import { ITask } from '../../../domains/cfm/interface';
import { IAppointment } from '../../restClient/fleet/appointment';
import { FleetService } from '../../restClient/fleet/fleet.service';
import { MelonadeAbstraction } from '../melonade.abstraction';

const DECISION = {
  ZONE: 'ZONE',
  SUB: 'SUB',
  SUBZONE: 'SUB_ZONE',
}

const FORMAT_DATE = 'YYYY-MM-DD HH:mm:ss'

enum APPOINTMENT_TYPE {
  APPOINTMENT = 'appointment',
  APPOINTMENT_SUB = 'appointment_sub',
  DEADLINE = 'deadline'
}

enum APPOINTMENT_TYPE_UNIT {
  DAY = 'day',
  MINUTE = 'minute'
}

interface IAppointmentType {
  type: APPOINTMENT_TYPE
  value: string
  unit: APPOINTMENT_TYPE_UNIT.DAY | APPOINTMENT_TYPE_UNIT.MINUTE
}

@Service()
export class WFM_APPLY_TASKTYPE_DECISION extends MelonadeAbstraction {
  readonly taskName = 'wfm_apply_tasktype_decision';

  constructor(
    private fleetService: FleetService) {
    super();
  }

  async process({ input }: IMelonadeTask): Promise<ITaskResponse> {
    const {
      decision,
      order,
      sub,
      zone,
      appointmentType,
    } = input;
    let task = order.tasks?.[0] || ({} as ITask);
    let response = {}

    // @DECISION zone
    if (decision === DECISION.ZONE) {
      const { taskTypeId, taskTypeCode, durationAsMinutes } = zone
      if (!taskTypeId || !taskTypeCode) return this.workerFailed({
        message: `taskTypeId is empty ${taskTypeId}`
      })

      let zoneOrder = clone(order)
      let zoneTask = clone(task)
      zoneTask = await this.buildZonePayload(
        zoneTask,
        zoneOrder.orderId,
        taskTypeId,
        taskTypeCode,
        order.appointmentNo,
        appointmentType,
        durationAsMinutes)
      zoneOrder.tasks = [zoneTask]
      response = { order: zoneOrder }
    } else if (decision === DECISION.SUBZONE) {
      // @DECISION subzone
      const {
        taskTypeId: zoneTaskTypeId,
        taskTypeCode: zoneTaskTypeCode,
        durationAsMinutes: zoneDurationAsMinutes,
      } = zone

      const { taskTypeId: subTaskTypeId, taskTypeCode: subTaskTypeCode } = sub
      if (!zoneTaskTypeId || !zoneTaskTypeCode) return this.workerFailed({
        message: `zoneTaskTypeId is empty ${zoneTaskTypeId}`
      })
      if (!subTaskTypeId || !subTaskTypeCode) return this.workerFailed({
        message: `subTaskTypeId is empty ${subTaskTypeId}`
      })

      // build sub payload
      let subOrder = clone(order)
      let subTask = clone(task)
      subTask = this.buildSubPayload(subTask, order.appointmentNo)
      subOrder.tasks = [subTask]

      // Build zone payload
      let zoneOrder = clone(order)
      let zoneTask = clone(task)
      zoneTask = await this.buildZonePayload(
        zoneTask, zoneOrder.orderId, zoneTaskTypeId, zoneTaskTypeCode,
        order.appointmentNo, appointmentType, zoneDurationAsMinutes)
      zoneOrder.tasks = [zoneTask]
      response = {
        order: {
          subOrder: subOrder,
          zoneOrder: zoneOrder,
        }
      }
    } else if (decision === DECISION.SUB) {
      // @DECISION sub
      // build sub payload
      const subTask = this.buildSubPayload(task, order.appointmentNo)
      order.tasks = [subTask]
      response = { order: order }
    }

    return this.workerCompleted({
      ...response
    });
  }

  async compensate(_: IMelonadeTask): Promise<ITaskResponse> {
    return this.workerCompleted({ message: 'nothing to compensate.' });
  }

  private buildSubPayload(
    task: any,
    appointmentNo: string,
  ) {

    const installationInfo = task.information?.metaInformation?.installationInformation || {}
    const qrunAppointDate = installationInfo.serviceOrderInfo?.productOrderList?.[0].appointDate || ''
    const appointDate = moment(qrunAppointDate).set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    task = assocPath(
      ['information', 'metaInformation', 'baseInformation'],
      {
        ...task.information?.metaInformation?.baseInformation || {},
        deadline: !!appointmentNo ?
          task.windowTime?.[1] ? moment(task.windowTime[1]).format(FORMAT_DATE) : '' :
          appointDate.format(FORMAT_DATE)
      },
      task)

    task = assocPath(
      ['information', 'metaInformation', 'extraInformation'],
      {
        ...task.information?.metaInformation?.extraInformation || {},
        taskAssignmentType: DECISION.SUB,
        taskTypeCode: task.taskTypeCode,
      },
      task)

    task = assocPath(
      ['information', 'metaInformation', 'orderBaseInformation'],
      {
        ...task.information?.metaInformation?.orderBaseInformation || {},
        priority: 'Medium',
        planStartTime: task.windowTime?.[0] || '',
        planFinishTime: task.windowTime?.[1] || '',
      },
      task)

    return task
  }

  private async buildZonePayload(
    task: any,
    orderId: string,
    taskTypeId: string,
    taskTypeCode: string,
    appointmentNo: string,
    appointmentType: IAppointmentType,
    durationAsMinutes: number) {

    const appointment = await this.getAppointment(appointmentNo)
    const queue = this.getQueue(appointmentType)
    const timeQR = this.getTimeQR(appointment, appointmentType)
    const timeQA = this.getTimeQA(task, appointment, appointmentType)
    task.windowTime = this.getWindowTime(appointmentType, timeQA, timeQR, durationAsMinutes)
    const deadline = this.getDeadline(appointmentType, timeQR, task.windowTime)
    task.taskType = taskTypeId
    task.taskTypeCode = taskTypeCode
    task = assocPath(
      ['information', 'metaInformation', 'baseInformation'],
      {
        ...task.information?.metaInformation?.baseInformation || {},
        appointmentNo: '',
        appointmentTime: timeQA ? moment(timeQA).format(FORMAT_DATE) : timeQA,
        standardTimeLength: durationAsMinutes,
        deadline,
      },
      task)
    task = assocPath(
      ['information', 'metaInformation', 'orderBaseInformation'],
      {
        ...task.information?.metaInformation?.orderBaseInformation || {},
        areaCode: task.information?.metaInformation?.areaInformation?.areaCode || '',
        priority: 'Medium',
        location: {
          latitude: null,
          longitude: null,
        },
        planStartTime: '',
        planFinishTime: '',
      },
      task)
    task = assocPath(
      ['information', 'metaInformation', 'extraInformation'],
      {
        ...task.information?.metaInformation?.extraInformation || {},
        queue: queue,
        taskAssignmentType: DECISION.ZONE,
        taskTypeCode: task.taskTypeCode,
      },
      task)

    task.standardTimeLength = durationAsMinutes
    task.appointmentNo = ''
    if (task.information?.metaInformation?.baseInformation?.appointmentNo) {
      task.information.metaInformation.baseInformation.appointmentNo = ''
    }

    task.staffs = []
    task.status = 'NEW'
    task.orderId = orderId

    if (queue === "A") {
      task.isSkipSlotValidation = true;
    }

    return task
  }

  private getWindowTime(
    appointmentType: IAppointmentType, timeQA: string, timeQR: string, durationAsMinutes: number) {
    let windowTime = ['', '']
    if (this.isQueueA(appointmentType)) {
      const windowTimeFrom = moment(timeQA).toISOString()
      const windowTimeTo = moment(timeQA).add(durationAsMinutes, 'minute').toISOString()
      windowTime = [windowTimeFrom, windowTimeTo]
    } else {
      const windowTimeFrom = moment(timeQA).subtract(durationAsMinutes, 'minute').toISOString()
      const windowTimeTo = moment(timeQR).toISOString()
      windowTime = [windowTimeFrom, windowTimeTo]
    }

    return windowTime
  }

  private getTimeQA(task: any, appointment: IAppointment, appointmentType: IAppointmentType) {
    const applyDate = task.information?.metaInformation?.installationInformation?.serviceOrderInfo?.createDate
    if (applyDate && appointmentType.type === APPOINTMENT_TYPE.APPOINTMENT) {
      const mApplyDate = this.calculateApplyDate(applyDate)
      const appointmentTime = mApplyDate.add(appointmentType.value, appointmentType.unit)
      return appointmentTime.toISOString()
    }

    if (appointmentType.type === APPOINTMENT_TYPE.APPOINTMENT_SUB) {
      const appointemntFrom = moment(appointment.appointmentFrom)
      return appointemntFrom.toISOString()
    }

    return ''
  }

  private getTimeQR(appointment: IAppointment, appointmentType: IAppointmentType) {
    if (!this.isQueueA(appointmentType)) {
      const appointemntFrom = moment(appointment.appointmentFrom)
      const zoneAppointmentFrom = appointemntFrom.subtract(appointmentType.value, appointmentType.unit)
      return zoneAppointmentFrom.toISOString()
    }
    return appointment.appointmentTo.toString()
  }

  private getDeadline(appointmentType: IAppointmentType, timeQR: string, windowTime: string[]) {
    if (this.isQueueA(appointmentType)) return moment(windowTime[1]).format(FORMAT_DATE)

    return moment(timeQR).format(FORMAT_DATE)
  }

  private async getAppointment(appointmentNo: string): Promise<IAppointment> {
    try {
      const appointment = await this.fleetService.getInstallationAppointment(appointmentNo)
      return appointment
    } catch (err) {
      throw err
    }
  }

  private calculateApplyDate(applyDate: string) {
    const fApplyDate = moment(applyDate, FORMAT_DATE).subtract(7, 'hour')
    const seconds = fApplyDate.seconds()
    return seconds ? fApplyDate.add(1, 'minute').startOf('minute') : fApplyDate
  }

  private getQueue(appointmentType: IAppointmentType) {
    return this.isQueueA(appointmentType) ? 'A' : 'R'
  }

  private isQueueA(appointmentType: IAppointmentType): boolean {
    return appointmentType.type === APPOINTMENT_TYPE.APPOINTMENT || appointmentType.type === APPOINTMENT_TYPE.APPOINTMENT_SUB
  }
}