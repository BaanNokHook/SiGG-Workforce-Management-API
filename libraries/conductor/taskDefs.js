const taskDefs = [
  {
    name: 'TMS_TRANSPORT',
    retryCount: 100,
    timeoutSeconds: 0,
    inputKeys: ['orderId', 'tripId', 'statuses', 'completeTransport', 'cancelWorkflow'],
    outputKeys: ['orderId', 'tripId', 'statuses', 'cancelWorkflow', 'staffId', 'completeTransport'],
    timeoutPolicy: 'RETRY',
    retryLogic: 'FIXED',
    retryDelaySeconds: 0,
    responseTimeoutSeconds: 1,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_CREATE_TASKS',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orders', 'orderId', 'statuses', 'mainWorkflowInstantId'],
    outputKeys: ['tasks', 'orderId', 'statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 5,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_CREATE_TRIP',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orderId', 'tasks', 'statuses', 'mainWorkflowInstantId'],
    outputKeys: [
      'tripId',
      'orderId',
      'statuses',
      'driverCriteria',
      'broadcastConfig',
      'vehicleType',
    ],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 5,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_MAPPING_BASE_MODEL_FOR_TAXI',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orders', 'orderId', 'statuses'],
    outputKeys: ['orders', 'orderId', 'statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 5,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'FLEET_FIND_DRIVER',
    retryCount: 0,
    timeoutSeconds: 60,
    inputKeys: [
      'orderId',
      'tripId',
      'driverCriteria',
      'statuses',
      'broadcastConfig',
      'passengerId',
    ],
    outputKeys: [
      'staffId',
      'tripId',
      'statuses',
      'broadcastUserIds',
      'broadcastId',
      'orderId',
      'vehicleId',
    ],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 10,
    responseTimeoutSeconds: 1,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'FLEET_GET_USER_CREATE_TASK_TRIP_WORKSCHEDULE',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orderId', 'staffId', 'tripId', 'statuses', 'vehicleId'],
    outputKeys: ['statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'CANCEL_DRIVER',
    retryCount: 0,
    timeoutSeconds: 3600,
    inputKeys: [
      'orderId',
      'trip',
      'tasks',
      'staffId',
      'passengers',
      'workflowInstanceId',
      'orderStatus',
    ],
    outputKeys: ['statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_DELETE_TRIP_TASK_TODOS',
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    inputKeys: [],
    outputKeys: [],
  },
  {
    name: 'TMS_SUMMARY',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orderId', 'tripId', 'staffId', 'statuses'],
    outputKeys: ['orderId', 'tripId', 'staffId', 'statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_CANCEL_FLOW',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['tripId', 'staffId', 'orderId', 'statuses', 'cancelBy'],
    outputKeys: ['tripId', 'staffId', 'orderId', 'statuses', 'cancelBy'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'TMS_CREATE_TASKS_BY_TASKTYPE',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orders', 'orderId', 'statuses', 'mainWorkflowInstantId'],
    outputKeys: ['tasks', 'orderId', 'statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 5,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
  {
    name: 'DISPATCH_OPTIMIZE',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orders', 'orderId', 'statuses', 'mainWorkflowInstantId'],
    outputKeys: ['tasks', 'orderId', 'statuses'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 5,
    responseTimeoutSeconds: 3600,
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
  },
]
export default taskDefs