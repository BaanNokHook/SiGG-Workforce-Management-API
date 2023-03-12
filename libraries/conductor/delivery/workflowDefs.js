const workflowDefs = [
  {
    name: 'TRD_FLEET_FIND_DRIVER_FLOW',
    description: 'Create Trip Tasks Todos for order from oms',
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    version: 1,
    tasks: [
      {
        name: 'TRD_FLEET_FIND_DRIVER',
        taskReferenceName: 'TRD_FLEET_FIND_DRIVER',
        type: 'SIMPLE',
        inputParameters: {
          orderId: '${workflow.input.orderId}',
          orderMetadata: '${workflow.input.orderMetadata}',
          tripId: '${workflow.input.tripId}',
          vehicleType: '${workflow.input.vehicleType}',
          driverCriteria: '${workflow.input.driverCriteria}',
          broadcastConfig: '${workflow.input.broadcastConfig}',
          statuses: '${workflow.input.statuses}',
          'uber-trace-id': '${workflow.input.uber-trace-id}',
        },
        optional: false,
      },
      {
        name: 'TRD_FLEET_GET_USER_CREATE_TASK_TRIP_WORKSCHEDULE',
        taskReferenceName: 'TRD_FLEET_GET_USER_CREATE_TASK_TRIP_WORKSCHEDULE',
        type: 'SIMPLE',
        inputParameters: {
          orderId: '${workflow.input.orderId}',
          orderMetadata: '${workflow.input.orderMetadata}',
          staffId: '${TRD_FLEET_FIND_DRIVER.output.staffId}',
          tripId: '${TRD_FLEET_FIND_DRIVER.output.tripId}',
          statuses: '${TRD_FLEET_FIND_DRIVER.output.statuses}',
          'uber-trace-id': '${TRD_FLEET_FIND_DRIVER.output.uber-trace-id}',
          vehicleId: '${TRD_FLEET_FIND_DRIVER.output.vehicleId}',
        },
        optional: false,
      },
    ],
    schemaVersion: 2,
    inputParameters: ['trip', 'uber-trace-id'],
  },
  {
    name: 'TRUE_RYDE_DELIVERY_ADVANCE_PAYMENT_FLOW',
    description: 'Create Trip Taxi Extension ',
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    version: 1,
    tasks: [
      {
        name: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
        taskReferenceName: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
        inputParameters: {
          orders: '${workflow.input.order}',
          mainWorkflowInstantId: '${workflow.workflowId}',
          orderId: '${workflow.input.order.orderId}',
          'uber-trace-id': '${workflow.input.uber-trace-id}',
        },
        type: 'SUB_WORKFLOW',
        subWorkflowParam: {
          name: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
          version: 1,
        },
      },
      {
        name: 'TRD_FLEET_FIND_DRIVER_FLOW',
        taskReferenceName: 'TRD_FLEET_FIND_DRIVER_FLOW',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          passengerId: '${workflow.input.order.owner.userId}',
          tripId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.tripId}',
          driverCriteria: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.driverCriteria}',
          vehicleType: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.vehicleType}',
          broadcastConfig: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.broadcastConfig}',
          statuses: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.statuses}',
          'uber-trace-id': '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.uber-trace-id}',
        },
        type: 'SUB_WORKFLOW',
        subWorkflowParam: {
          name: 'TRD_FLEET_FIND_DRIVER_FLOW',
          version: 1,
        },
      },
      {
        name: 'TRD_TMS_TRANSPORT',
        taskReferenceName: 'TRD_TMS_TRANSPORT',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          tripId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.tripId}',
          staffId: '${TRD_FLEET_FIND_DRIVER_FLOW.output.staffId}',
          statuses: '${TRD_FLEET_FIND_DRIVER_FLOW.output.statuses}',
          'uber-trace-id': '${TRD_FLEET_FIND_DRIVER_FLOW.output.uber-trace-id}',
        },
        type: 'SIMPLE',
      },
      {
        name: 'TRD_TMS_SUMMARY',
        taskReferenceName: 'TRD_TMS_SUMMARY',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          tripId: '${TRD_TMS_TRANSPORT.output.tripId}',
          staffId: '${TRD_TMS_TRANSPORT.output.staffId}',
          statuses: '${TRD_TMS_TRANSPORT.output.statuses}',
          'uber-trace-id': '${TRD_TMS_TRANSPORT.output.uber-trace-id}',
        },
        type: 'SIMPLE',
      },
    ],
    schemaVersion: 2,
    failureWorkflow: 'TRD_TMS_FAILURE_FLOW',
    inputParameters: [],
  },
  {
    name: 'TRUE_RYDE_DELIVERY_FLOW',
    description: 'Create Trip Taxi Extension ',
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    version: 1,
    tasks: [
      {
        name: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
        taskReferenceName: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
        inputParameters: {
          orders: '${workflow.input.order}',
          mainWorkflowInstantId: '${workflow.workflowId}',
          orderId: '${workflow.input.order.orderId}',
          'uber-trace-id': '${workflow.input.uber-trace-id}',
        },
        type: 'SUB_WORKFLOW',
        subWorkflowParam: {
          name: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
          version: 1,
        },
      },
      {
        name: 'TRD_FLEET_FIND_DRIVER_FLOW',
        taskReferenceName: 'TRD_FLEET_FIND_DRIVER_FLOW',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          passengerId: '${workflow.input.order.owner.userId}',
          tripId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.tripId}',
          driverCriteria: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.driverCriteria}',
          vehicleType: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.vehicleType}',
          broadcastConfig: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.broadcastConfig}',
          statuses: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.statuses}',
          'uber-trace-id': '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.uber-trace-id}',
        },
        type: 'SUB_WORKFLOW',
        subWorkflowParam: {
          name: 'TRD_FLEET_FIND_DRIVER_FLOW',
          version: 1,
        },
      },
      {
        name: 'TRD_TMS_TRANSPORT',
        taskReferenceName: 'TRD_TMS_TRANSPORT',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          tripId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.tripId}',
          staffId: '${TRD_FLEET_FIND_DRIVER_FLOW.output.staffId}',
          statuses: '${TRD_FLEET_FIND_DRIVER_FLOW.output.statuses}',
          'uber-trace-id': '${TRD_FLEET_FIND_DRIVER_FLOW.output.uber-trace-id}',
        },
        type: 'SIMPLE',
      },
      {
        name: 'TRD_TMS_SUMMARY',
        taskReferenceName: 'TRD_TMS_SUMMARY',
        inputParameters: {
          orderId: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderId}',
          orderMetadata: '${TRD_TMS_CREATE_TRIP_TASK_TODO.output.orderMetadata}',
          tripId: '${TRD_TMS_TRANSPORT.output.tripId}',
          staffId: '${TRD_TMS_TRANSPORT.output.staffId}',
          statuses: '${TRD_TMS_TRANSPORT.output.statuses}',
          'uber-trace-id': '${TRD_TMS_TRANSPORT.output.uber-trace-id}',
        },
        type: 'SIMPLE',
      },
    ],
    schemaVersion: 2,
    failureWorkflow: 'TRD_TMS_FAILURE_FLOW',
    inputParameters: [],
  },
  {
    name: 'TRD_TMS_CREATE_TRIP_TASK_TODO',
    description: 'TMS_CREATE_TRIP_TASK_TODO for DELIVERY',
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    version: 1,
    tasks: [
      {
        name: 'TMS_MAPPING_BASE_MODEL_FOR_DELIVERY',
        taskReferenceName: 'TMS_MAPPING_BASE_MODEL_FOR_DELIVERY',
        inputParameters: {
          orders: '${workflow.input.orders}',
          mainWorkflowInstantId: '${workflow.input.mainWorkflowInstantId}',
          orderId: '${workflow.input.orderId}',
          statuses: '${workflow.input.statuses}',
          'uber-trace-id': '${workflow.input.uber-trace-id}',
        },
        type: 'SIMPLE',
        optional: false,
      },
      {
        name: 'TRD_TMS_CREATE_TASKS',
        taskReferenceName: 'TRD_TMS_CREATE_TASKS',
        type: 'SIMPLE',
        inputParameters: {
          mainWorkflowInstantId: '${workflow.input.mainWorkflowInstantId}',
          orders: '${TMS_MAPPING_BASE_MODEL_FOR_DELIVERY.output.orders}',
          orderId: '${TMS_MAPPING_BASE_MODEL_FOR_DELIVERY.output.orderId}',
          statuses: '${TMS_MAPPING_BASE_MODEL_FOR_DELIVERY.output.statuses}',
          'uber-trace-id': '${TMS_MAPPING_BASE_MODEL_FOR_DELIVERY.output.uber-trace-id}',
        },
        optional: false,
      },
      {
        name: 'TRD_TMS_CREATE_TRIP',
        taskReferenceName: 'TRD_TMS_CREATE_TRIP',
        type: 'SIMPLE',
        inputParameters: {
          mainWorkflowInstantId: '${workflow.input.mainWorkflowInstantId}',
          tasks: '${TRD_TMS_CREATE_TASKS.output.tasks}',
          orders: '${TRD_TMS_CREATE_TASKS.output.orders}',
          orderId: '${TMS_MAPPING_BASE_MODEL_FOR_DELIVERY.output.orderId}',
          statuses: '${TRD_TMS_CREATE_TASKS.output.statuses}',
          'uber-trace-id': '${TRD_TMS_CREATE_TASKS.output.uber-trace-id}',
        },
        optional: false,
      },
    ],
    schemaVersion: 2,
    failureWorkflow: 'TRD_TMS_FAILURE_FLOW',
    inputParameters: ['orders', 'orderId', 'statuses', 'mainWorkflowInstantId', 'uber-trace-id'],
  },
  {
    name: 'TRD_TMS_FAILURE_FLOW',
    description: 'Workflow for remove trip task todos and cancel flow',
    ownerEmail: '4pl-tms-owner@true-e-logistics.com',
    version: 1,
    schemaVersion: 2,
    tasks: [
      {
        name: 'TRD_TMS_DELETE_TRIP_TASK_TODOS',
        taskReferenceName: 'TRD_TMS_DELETE_TRIP_TASK_TODOS',
        type: 'SIMPLE',
        inputParameters: {
          orders: '${workflow.input}',
        },
        optional: false,
      },
    ],
    inputParameters: ['orders', 'trip'],
  },
]
export default workflowDefs
