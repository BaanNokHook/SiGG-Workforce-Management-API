import { Types } from 'mongoose'
import * as R from 'ramda'
import * as moment from 'moment-timezone'
import taskRepository from '../../../models/task.repository'
import staffRepository from '../../../models/staff.repository'
import taskTypeGroupRepository from '../../../models/taskTypeGroup.repository'
import { fleetApiService } from '../../../adapters/restClient/fleet'
import { addressApiService } from '../../../adapters/restClient/address'
import {
  WFM_ASSIGN_TASK_STATUS,
  WFM_CANCELLED_TASK_STATUS,
  WFM_UNASSIGN_TASK_STATUS,
} from './findMonitorListTasks'

const taskSourceSystem = {
  INSTALLATION: 'INSTALLATION',
  ASSURANCE: 'ASSURANCE',
}

export async function enrichESTask(id) {
  const task = await taskRepository.model
    .findOne({
      _id: Types.ObjectId(id),
    })
    .populate([
      { path: 'taskTypeId', select: '_id name durationTime taskTypeGroup mapping' },
      { path: 'geographyId', select: '_id name type address owner feature metadata' },
    ])
    .select({
      taskId: 1,
      staffs: 1,
      orderId: 1,
      status: 1,
      taskTypeId: 1,
      priority: 1,
      startedAt: 1,
      completedAt: 1,
      createdAt: 1,
      updatedAt: 1,
      information: 1,
      appointmentNo: 1,
      tracking: 1,
      windowTime: 1,
      projectId: 1,
      companyId: 1,
      tripId: 1,
      ruleType: 1,
      teamId: 1,
    })
    .lean()

  const areaCode = R.pathOr(
    '',
    ['information', 'metaInformation', 'areaInformation', 'areaCode'],
    task,
  )
  const subDistrictCode = areaCode.slice(0, 6)
  const districtCode = areaCode.slice(0, 4)
  const provinceCode = areaCode.slice(0, 2)
  const staffId = R.pathOr(null, ['staffs', 0], task)
  const taskTypeGroupId = R.pathOr(null, ['taskTypeId', 'taskTypeGroup'], task)

  const [staff, taskTypeGroup, areas, appointment] = await Promise.all([
    staffRepository.model
      .findOne({ _id: Types.ObjectId(staffId), deleted: false })
      .select({ firstname: 1, lastname: 1, teamIds: 1 })
      .lean(),
    taskTypeGroupRepository.model
      .findOne({ _id: Types.ObjectId(taskTypeGroupId), deleted: false })
      .select({ name: 1 })
      .lean(),
    addressApiService.getConfigGeographiesByAreaCodes([
      subDistrictCode,
      districtCode,
      provinceCode,
    ]),
    fleetApiService.getAppointment(task.appointmentNo),
  ])

  const teamId = task.teamId ? task.teamId : staff ? staff.teamIds[0] : null
  const team = teamId && (await fleetApiService.getTeam(teamId))

  let subDistrict, district, province
  areas.forEach((area) => {
    if (area.metadata.areaCode === subDistrictCode) {
      subDistrict = area
    } else if (area.metadata.areaCode === districtCode) {
      district = area
    } else if (area.metadata.areaCode === provinceCode) {
      province = area
    }
  })

  const sourceSystem = findSourceSystem(task)
  let enrichedTask

  switch (sourceSystem) {
    case taskSourceSystem.INSTALLATION:
      enrichedTask = enrichInstallationTask({
        ...task,
        staff,
        team,
        taskTypeGroup,
        appointment,
        subDistrict,
        district,
        province,
      })
      break
    case taskSourceSystem.ASSURANCE:
    default:
      enrichedTask = enrichAssuranceTask({
        ...task,
        staff,
        team,
        taskTypeGroup,
        appointment,
        subDistrict,
        district,
        province,
      })
  }

  return enrichedTask
}

function findSourceSystem(task) {
  const createUser = R.path(
    ['information', 'metaInformation', 'baseInformation', 'createUser'],
    task,
  )
  if (createUser === 'QRUN') {
    return taskSourceSystem.INSTALLATION
  } else if (createUser === 'TRUE_CFM') {
    return taskSourceSystem.ASSURANCE
  }
}

function getAssignee(task) {
  if (task.tracking && task.tracking.length) {
    const assigned = task.tracking.find((t) => t.type === 'TaskAssigned')
    return R.pathOr(null, ['creator', 'firstname'], assigned)
  }
  return null
}

function getStatusSequence(status) {
  if (WFM_UNASSIGN_TASK_STATUS.includes(status)) return 1
  if (WFM_ASSIGN_TASK_STATUS.includes(status)) return 2
  if ([WFM_CANCELLED_TASK_STATUS].includes(status)) return 3
  return 4
}

function enrichInstallationTask(task) {
  const { staff, team, taskTypeGroup, appointment, subDistrict, district, province } = task
  return {
    taskId: task.taskId,
    status: task.status,
    windowTime: task.windowTime,
    staffId: staff && staff._id,
    staffName: staff && `${staff.firstname} ${staff.lastname}`.trim(),
    teamId: team && team._id,
    teamName: team && team.name,
    priority: task.priority,
    orderId: task.orderId,
    tripId: task.tripId,
    sourceSystem: taskSourceSystem.INSTALLATION,
    deadline: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'deadline'],
      task,
    ),
    createUser: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'createUser'],
      task,
    ),
    durationTime: task.taskTypeId.durationTime,
    taskTypeId: task.taskTypeId._id,
    taskTypeName: task.taskTypeId.name,
    taskTypeGroupId: taskTypeGroup._id,
    taskTypeGroupName: taskTypeGroup.name,
    appointmentNo: appointment && appointment.appointmentNo,
    appointmentDate: appointment && appointment.appointmentDate,
    appointmentFrom: appointment && appointment.appointmentFrom,
    appointmentTo: appointment && appointment.appointmentTo,
    appointmentTime: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'appointmentTime'],
      task,
    ),
    assignedBy: getAssignee(task),
    requestNo: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'requestNo'],
      task,
    ),
    eventCodes: task.taskTypeId.mapping.flatMap((m) => m.eventCodes),
    productName: R.pathOr(
      [],
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'productOrderList',
      ],
      task,
    ).map((product) => product.product.prodSpecCode),
    serviceAccessNo: R.pathOr(
      [],
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'productOrderList',
      ],
      task,
    ).map((product) => product.product.serviceNo),
    networkType: R.pathOr(
      [],
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'productOrderList',
      ],
      task,
    ).map((product) => product.product.accessMode),
    customerName: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'custName',
      ],
      task,
    ),
    customerAddress: R.pathOr(null, ['geographyId', 'address', 'address'], task),
    contactName: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactName',
      ],
      task,
    ),
    contactPhone: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactPhone',
      ],
      task,
    ),
    contactName2: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactName2',
      ],
      task,
    ),
    contactPhone2: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactPhone2',
      ],
      task,
    ),
    contactName3: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactName3',
      ],
      task,
    ),
    contactPhone3: R.pathOr(
      null,
      [
        'information',
        'metaInformation',
        'installationInformation',
        'serviceOrderInfo',
        'customer',
        'contact',
        'contactPhone3',
      ],
      task,
    ),
    location: {
      lat: R.pathOr(null, ['geographyId', 'feature', 'geometry', 'coordinates', 1], task),
      lon: R.pathOr(null, ['geographyId', 'feature', 'geometry', 'coordinates', 0], task),
    },
    areaCode: R.pathOr(null, ['geographyId', 'metadata', 'areaCode'], task),
    areaName: R.pathOr(null, ['geographyId', 'name'], task),
    subDistrictCode: R.pathOr(null, ['metadata', 'areaCode'], subDistrict),
    subDistrict: R.pathOr(null, ['name'], subDistrict),
    districtCode: R.pathOr(null, ['metadata', 'areaCode'], district),
    districtName: R.pathOr(null, ['name'], district),
    provinceCode: R.pathOr(null, ['metadata', 'areaCode'], province),
    provinceName: R.pathOr(null, ['name'], province),
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    planStartTime: R.pathOr(null, ['windowTime', 0], task),
    planFinishTime: R.pathOr(null, ['windowTime', 1], task),
    priorityName: R.pathOr(
      null,
      ['information', 'metaInformation', 'orderBaseInformation', 'priority'],
      task,
    ),
    prodType: R.pathOr(null, ['information', 'prodType'], task),
    statusSequence: getStatusSequence(task.status),
    projectId: task.projectId,
    companyId: task.companyId,
    tracking: task.tracking,
    ruleType: task.ruleType,
    isUpsell: R.pathOr(false, ['information','metaInformation','orderBaseInformation','isUpsell'], task)
  }
}

function enrichAssuranceTask(task) {
  const { staff, team, taskTypeGroup, appointment, subDistrict, district, province } = task
  let deadline = R.pathOr(
    null,
    ['information', 'metaInformation', 'baseInformation', 'deadline'],
    task,
  )
  deadline = moment.tz(deadline, 'Asia/Bangkok').toISOString()
  return {
    taskId: task.taskId,
    status: task.status,
    windowTime: task.windowTime,
    staffId: staff && staff._id,
    staffName: staff && `${staff.firstname} ${staff.lastname}`.trim(),
    teamId: R.pathOr(null, ['_id'], team),
    teamName: R.pathOr(null, ['name'], team),
    priority: task.priority,
    orderId: task.orderId,
    tripId: task.tripId,
    sourceSystem: taskSourceSystem.ASSURANCE,
    deadline,
    createUser: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'createUser'],
      task,
    ),
    durationTime: R.pathOr(null, ['taskTypeId', 'durationTime'], task),
    taskTypeId: R.pathOr(null, ['taskTypeId', '_id'], task),
    taskTypeName: R.pathOr(null, ['taskTypeId', 'name'], task),
    taskTypeGroupId: R.pathOr(null, ['taskTypeId', 'taskTypeGroup'], task),
    taskTypeGroupName: taskTypeGroup.name,
    appointmentNo: appointment && appointment.appointmentNo,
    appointmentDate: appointment && appointment.appointmentDate,
    appointmentFrom: appointment && appointment.appointmentFrom,
    appointmentTo: appointment && appointment.appointmentTo,
    appointmentTime: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'appointmentTime'],
      task,
    ),
    assignedBy: getAssignee(task),
    queue: R.pathOr(null, ['information', 'queue'], task),
    requestNo: R.pathOr(
      null,
      ['information', 'metaInformation', 'baseInformation', 'requestNo'],
      task,
    ),
    productName: R.pathOr(null, ['information', 'accessTypes'], task),
    serviceAccessNo: R.pathOr(null, ['information', 'prodId'], task),
    customerName: R.pathOr(
      null,
      ['information', 'metaInformation', 'customerInformation', 'customerName'],
      task,
    ),
    customerAddress: R.pathOr(null, ['geographyId', 'address', 'address'], task),
    returnReason: '',
    networkType: R.pathOr(
      null,
      ['information', 'metaInformation', 'workOrderInformation', 'networkCatalog'],
      task,
    ),
    requestType: R.pathOr(
      null,
      ['information', 'metaInformation', 'workOrderInformation', 'requestType'],
      task,
    ),
    location: {
      lat: R.pathOr(null, ['geographyId', 'feature', 'geometry', 'coordinates', 1], task),
      lon: R.pathOr(null, ['geographyId', 'feature', 'geometry', 'coordinates', 0], task),
    },
    areaCode: R.pathOr(null, ['geographyId', 'metadata', 'areaCode'], task),
    areaName: R.pathOr(
      null,
      ['information', 'metaInformation', 'areaInformation', 'areaName'],
      task,
    ),
    subDistrictCode: R.pathOr(null, ['metadata', 'areaCode'], subDistrict),
    subDistrict: R.pathOr(null, ['name'], subDistrict),
    districtCode: R.pathOr(null, ['metadata', 'areaCode'], district),
    districtName: R.pathOr(null, ['name'], district),
    provinceCode: R.pathOr(null, ['metadata', 'areaCode'], province),
    provinceName: R.pathOr(null, ['name'], province),
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    planStartTime: R.pathOr(null, ['windowTime', 0], task),
    planFinishTime: R.pathOr(null, ['windowTime', 1], task),
    priorityName: R.pathOr(
      null,
      ['information', 'metaInformation', 'orderBaseInformation', 'priority'],
      task,
    ),
    prodType: R.pathOr(null, ['information', 'prodType'], task),
    statusSequence: getStatusSequence(task.status),
    projectId: task.projectId,
    companyId: task.companyId,
  }
}
