export const trip = {
  _id: 'tripId_111',
  staffs: ['staffId_111'],
  status: 'DOING',
  metadata: {
    config: { wallet: { consumerId: 44 }, driver: { fee: 120, bonus: 10 } },
    weomniTxRef: 'paymentRef',
    consumerName: 'Lotus',
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
  payment: {
    extraCODAmount: 15,
    detailService: {
      driver: {
        fee: 10,
        bonus: 10,
      },
    },
  },
}

export const task = {
  _id: 'taskId_111',
  status: 'PENDING',
  staffs: ['staffId_111'],
  information: {
    payment: { codAmount: 10 },
    phone: '0899999999',
  },
  tripId: trip,
}

export const taskRequireTxRef = {
  _id: 'taskId_111',
  status: 'PENDING',
  staffs: ['staffId_111'],
  information: {
    payment: { codAmount: 10 },
    phone: '0899999999',
  },
  tripId: {
    _id: 'tripId_111',
    staffs: ['staffId_111'],
    status: 'DOING',
    metadata: {
      config: { driver: { fee: 120, bonus: 10 } },
      consumerName: 'Lotus',
    },
  },
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
