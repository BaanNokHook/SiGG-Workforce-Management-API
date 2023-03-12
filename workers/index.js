import config from '../config/index'
import { SmsWorker } from './sendSms.worker'
import { SyncStaff } from './syncStaff.worker'
import { smsApiService } from '../adapters/restClient/sms'
import { urlShortenApiService } from '../adapters/restClient/urlShorten'
import { taskRepo } from '../models/implementations/taskRepo'
import { staffRepo } from '../models/implementations/staffRepo'
import { SyncCloseWorkOrderToTaskWorker } from './wfm/syncCloseWorkOrderToTask.worker'
import { TaskMonitorList } from './wfm/taskMonitorList.worker'
import { TriggerTripsStatusToWeomniEarns } from './ondemand/triggerTripsStatusToWeomniEarns.worker'

export const sendSms = new SmsWorker(
  {
    bootstrapServers: config.kafka.uri,
    consumerGroupId: `4pl-tms-api.ondemand.send-sms`,
    topic: `kc-mongo-source-ondemand.4pl-tms.todos`,
    options: {
      autoOffReset: 'earliest',
    },
  },
  config.ondemand.webTrackingUri,
  smsApiService,
  urlShortenApiService,
  taskRepo,
  config.sms.sourceNumber,
)

export const syncStaff = new SyncStaff(
  {
    bootstrapServers: config.kafka.uri,
    consumerGroupId: `4pl-tms-api.sync-staff`,
    topic: `kc-mongo-source-drivs.4pl-fleet.staffs`,
    options: {
      autoOffReset: 'latest',
    },
  },
  staffRepo,
)

export const syncCloseWorkOrderToTaskWorker = new SyncCloseWorkOrderToTaskWorker(
  {
    bootstrapServers: config.kafka.uri,
    consumerGroupId: `4pl-tms-api.wfm.sync-close-work-order-to-task`,
    topic: `kc-mongo-source-wfm.4pl-wfm-todoapp.work_orders`,
    options: {
      autoOffReset: 'latest',
    },
  },
  taskRepo,
)

export const taskMonitorList = new TaskMonitorList({
  bootstrapServers: config.kafka.uri,
  consumerGroupId: config.wfm.taskMonitorList.consumerGroupId,
  topic: `kc-mongo-source-wfm.4pl-tms.tasks`,
  options: {
    autoOffReset: 'latest',
    enableAutoCommit: false,
    retry: 3,
    retryDelay: 10000,
    maximumPollingMessages: 100,
    'max.poll.interval.ms': 400000,
  },
})

export const triggerTripsStatusToWeomniEarns = new TriggerTripsStatusToWeomniEarns({
  bootstrapServers: config.kafka.uri,
  consumerGroupId: `4pl-tms-api.ondemand.trigger-trips-status-to-weomni-earns`,
  topic: `kc-mongo-source-ondemand.4pl-tms.trips`,
  options: {
    autoOffReset: 'latest',
  },
})

export function bootstrapWorkers() {
  sendSms.start()
  syncStaff.start()
  syncCloseWorkOrderToTaskWorker.start()
  taskMonitorList.start()
  triggerTripsStatusToWeomniEarns.start()
}
