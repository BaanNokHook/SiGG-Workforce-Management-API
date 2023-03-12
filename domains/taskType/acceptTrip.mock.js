export const metadataWorkflow = [
  {
    taskId: '',
    taskName: '',
    taskReferenceName: '',
    workflowId: '',
    transactionId: 'transactionId_1',
    workflowName: 'PROJECT01_TRANSPORT',
    workflowRev: '1',
  },
  {
    taskId: '1',
    taskName: 'tms_todo_setoff_pickup',
    taskReferenceName: 'odm_tms_todo_setoff_pickup',
    workflowId: 'workflowId_1',
    transactionId: 'transactionId_1',
    workflowName: '',
    workflowRev: '',
  },
  {
    taskId: '2',
    taskName: 'tms_todo_sign_signature_pickup',
    taskReferenceName: 'odm_tms_todo_sign_signature_pickup',
    workflowId: 'workflowId_2',
    transactionId: 'transactionId_2',
    workflowName: '',
    workflowRev: '',
  },
  {
    taskId: '3',
    taskName: 'tms_waiting_accept_trip',
    taskReferenceName: 'odm_tms_waiting_accept_trip',
    workflowId: 'workflowId_1',
    transactionId: 'transactionId_3',
    workflowName: '',
    workflowRev: '',
  },
]

export const input = {
  userId: 'userId_111',
  lat: 13.6851301,
  lng: 100.6088319,
  date: '2020-03-30T14:49:38+07:00',
}

export const autoAssignCourierTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    code: 'PROCESS',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'PENDING',
    taskTypeId: {
      code: 'ACCEPT_TRIP',
    },
    tripId: {
      _id: 'tripId_111',
      orderId: 'orderId01',
      orderReferenceId: 'orderReferenceId01',
      status: 'PENDING',
      companyId: 'companyId01',
      projectId: 'projectId01',
      windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
      metadata: {
        optimized: {
          couriers: [
            { _id: 'companyId01', name: 'CPF' },
            { _id: 'companyId02', name: 'SENDIT' },
          ],
        },
        workflows: metadataWorkflow,
        dispatch: {
          order: {
            ticketId: 'dispatch_ticket_id',
            token: 'dispatch_token_id',
          },
        },
      },
    },
  },
}

export const manualAssignCourierTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    code: 'PROCESS',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'PENDING',
    taskTypeId: {
      code: 'ACCEPT_TRIP',
    },
    tripId: {
      _id: 'tripId_111',
      orderId: 'orderId01',
      orderReferenceId: 'orderReferenceId01',
      status: 'PENDING',
      companyId: 'companyId01',
      projectId: 'projectId01',
      windowTime: ['2021-06-08T09:00:00.000Z', '2021-06-08T10:00:00.000Z'],
      metadata: {
        optimized: {
          couriers: [
            { _id: 'companyId01', name: 'CPF' },
            { _id: 'companyId02', name: 'SENDIT' },
          ],
        },
        workflows: metadataWorkflow,
      },
    },
  },
}

export const completedTodo = {
  _id: 'todoId_111',
  status: 'DONE',
  todoType: {
    code: 'PROCESS',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'PENDING',
    taskTypeId: {
      code: 'ACCEPT_TRIP',
    },
    tripId: {
      _id: 'tripId_111',
      status: 'PENDING',
      metadata: {
        workflows: metadataWorkflow,
      },
    },
  },
}

export const inactiveTask = {
  _id: 'todoId_111',
  status: 'DONE',
  todoType: {
    code: 'PROCESS',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'FAILED',
    taskTypeId: {
      code: 'ACCEPT_TRIP',
    },
    tripId: {
      _id: 'tripId_111',
      status: 'PENDING',
      metadata: {
        workflows: metadataWorkflow,
      },
    },
  },
}

export const inactiveTrip = {
  _id: 'todoId_111',
  status: 'DONE',
  todoType: {
    code: 'PROCESS',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'DONE',
    taskTypeId: {
      code: 'ACCEPT_TRIP',
    },
    tripId: {
      _id: 'tripId_111',
      status: 'DONE',
      metadata: {
        workflows: metadataWorkflow,
      },
    },
  },
}
