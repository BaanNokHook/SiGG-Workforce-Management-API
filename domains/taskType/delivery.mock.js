export const input = {
  userId: 'userId_111',
  lat: 13.6851301,
  lng: 100.6088319,
  date: '2020-03-30T14:49:38+07:00',
  relationship: 'เจ้าของสินค้า',
}

export const trip = {
  _id: 'tripId_111',
  staffs: ['staffId_111'],
  status: 'DOING',
  metadata: {
    workflows: [
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_setoff',
        taskReferenceName: 'odm_tms_todo_setoff_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_checkin',
        taskReferenceName: 'odm_tms_todo_checkin_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_take_photo',
        taskReferenceName: 'odm_tms_todo_take_photo_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_sign_signature',
        taskReferenceName: 'odm_tms_todo_sign_signature_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_collect_cash',
        taskReferenceName: 'odm_tms_todo_collect_cash_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_delivered',
        taskReferenceName: 'odm_tms_todo_delivered',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
    ],
  },
}

export const task = {
  _id: 'taskId_111',
  status: 'PENDING',
  information: {
    phone: '0899999999',
  },
  tripId: trip,
}

export const todos = [
  {
    _id: 'todoId_111',
    status: 'TODO',
  },
  {
    _id: 'todoId_222',
    status: 'DONE',
    isRequired: true,
  },
  {
    _id: 'todoId_333',
    status: 'DONE',
    isRequired: true,
  },
]

export const todo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    _id: 'todoType_111',
    name: 'todoType_name',
  },
}

export const requiredTodoNotDoneTask = {
  tripId: {
    status: 'DOING',
    staffs: ['staff_111'],
    _id: 'tripId_111',
  },
  information: {
    phone: '0899999999',
  },
  sequenceSystem: 2,
  sequenceManual: 0,
  todos: [
    {
      action: 'CLICK',
      status: 'DONE',
      isStart: true,
      _id: 'todoId_111',
    },
    {
      status: 'TODO',
      isRequired: true,
      deleted: false,
      _id: 'todoId_222',
    },
    {
      status: 'DONE',
      isRequired: true,
      _id: 'todoId_333',
    },
    {
      status: 'DONE',
      isRequired: true,
      _id: 'todoId_444',
    },
    {
      status: 'DONE',
      isRequired: true,
      _id: 'todoId_555',
    },
  ],
  status: 'DOING',
  _id: 'taskId_111',
}

export const taskInactiveTrip = {
  tripId: {
    status: 'FAILED',
    staffs: ['staffId_111'],
    _id: 'tripId_111',
  },
  information: {
    phone: '0899999999',
  },
  sequenceSystem: 2,
  sequenceManual: 0,
  todos: [],
  status: 'DONE',
  _id: 'taskId_111',
}

export const inactiveTask = {
  tripId: {
    status: 'DOING',
    staffs: ['staffId_111'],
    _id: 'tripId_111',
  },
  information: {
    phone: '0899999999',
  },
  sequenceSystem: 2,
  sequenceManual: 0,
  todos: [],
  status: 'FAILED',
  _id: 'taskId_111',
}

export const invalidTaskTypeTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    _id: 'todoType_111',
    name: 'todoType_name',
    code: 'INVALID_TODO_TYPE',
  },
}

export const afterSetoffTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    _id: 'todoType_111',
    name: 'todoType_name',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'DOING',
    information: {
      phone: '0899999999',
    },
    tripId: {
      _id: 'tripId_111',
      status: 'DOING',
      staffs: ['staffId_111'],
      metadata: {
        workflows: [
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_setoff',
            taskReferenceName: 'odm_tms_todo_setoff_delivery',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_checkin',
            taskReferenceName: 'odm_tms_todo_checkin_delivery',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_take_photo',
            taskReferenceName: 'odm_tms_todo_take_photo_delivery',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_sign_signature',
            taskReferenceName: 'odm_tms_todo_sign_signature_delivery',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_collect_cash',
            taskReferenceName: 'odm_tms_todo_collect_cash_delivery',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
          {
            taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
            taskName: 'tms_todo_delivered',
            taskReferenceName: 'odm_tms_todo_delivered',
            workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
            transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
          },
        ],
      },
    },
  },
}

export const inactiveTaskTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    _id: 'todoType_111',
    name: 'CHECK IN',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'FAILED',
    information: {
      phone: '0899999999',
    },
    tripId: {
      _id: 'tripId_111',
      staffs: ['staffId_111'],
      status: 'DOING',
    },
  },
}

export const inactiveTripTodo = {
  _id: 'todoId_111',
  status: 'TODO',
  todoType: {
    _id: 'todoType_111',
    name: 'CHECK IN',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'DOING',
    information: {
      phone: '0899999999',
    },
    tripId: {
      _id: 'tripId_111',
      staffs: ['staffId_111'],
      status: 'FAILED',
    },
  },
}

export const inactiveTodoSetOff = {
  _id: 'todoId_111',
  status: 'DONE',
  todoType: {
    _id: 'todoType_111',
    name: 'CHECK IN',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'PENDING',
    information: {
      phone: '0899999999',
    },
    tripId: {
      _id: 'tripId_111',
      staffs: ['staffId_111'],
      status: 'DOING',
    },
  },
}

export const inactiveTodo = {
  _id: 'todoId_111',
  status: 'DONE',
  todoType: {
    _id: 'todoType_111',
    name: 'CHECK IN',
  },
  taskId: {
    _id: 'taskId_111',
    status: 'DOING',
    information: {
      phone: '0899999999',
    },
    tripId: {
      _id: 'tripId_111',
      staffs: ['staffId_111'],
      status: 'DOING',
    },
  },
}

export const tripCredit = {
  _id: 'tripId_111',
  staffs: ['staffId_111'],
  status: 'DOING',
  metadata: {
    workflows: [
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_setoff',
        taskReferenceName: 'odm_tms_todo_setoff_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_checkin',
        taskReferenceName: 'odm_tms_todo_checkin_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_take_photo',
        taskReferenceName: 'odm_tms_todo_take_photo_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_sign_signature',
        taskReferenceName: 'odm_tms_todo_sign_signature_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_collect_cash',
        taskReferenceName: 'odm_tms_todo_collect_cash_delivery',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_delivered',
        taskReferenceName: 'odm_tms_todo_delivered',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
    ],
    config: {
      wallet: {
        isCreditWallet: true,
      },
    },
  },
}
