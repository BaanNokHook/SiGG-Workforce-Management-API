export const input = {
  userId: 'userId_111',
  lat: 13.6851301,
  lng: 100.6088319,
  date: '2020-03-30T14:49:38+07:00',
}

export const trip = {
  _id: 'tripId_111',
  staffs: ['staffId_111'],
  status: 'DOING',
  metadata: {
    workflows: [
      {
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
        transactionPrefix: 'transport-',
        workflowName: 'ODM_TRANSPORT',
        workflowRev: 1,
        taskId: '',
        taskName: '',
        taskReferenceName: '',
        workflowId: '',
      },
      {
        taskId: 'ee0ee03a-2f11-42f2-91bd-b45fb3494183',
        taskName: 'tms_todo_setoff',
        taskReferenceName: 'odm_tms_todo_setoff_pickup',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: '982811d3-0af8-4ae8-bd42-cbb1c410b7c4',
        taskName: 'tms_todo_checkin',
        taskReferenceName: 'odm_tms_todo_checkin_pickup',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: '2fb5ea28-ba9a-4fee-b832-864735347d07',
        taskName: 'tms_todo_take_photo',
        taskReferenceName: 'odm_tms_todo_take_photo_pickup',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'f1f0b563-550e-430e-9d29-d93d19a99a6d',
        taskName: 'tms_todo_sign_signature',
        taskReferenceName: 'odm_tms_todo_sign_signature_pickup',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
      {
        taskId: 'd2cc9b79-d5bf-4816-82ea-7fad8b21dbb6',
        taskName: 'tms_todo_picked_up',
        taskReferenceName: 'odm_tms_todo_picked_up',
        workflowId: '25c6c0f9-d39c-454a-ad20-7aa6ee3dd54a',
        transactionId: '4050bcb0-6fdd-11ea-9564-e14b61adae42-1',
      },
    ],
  },
}

export const task = {
  _id: 'taskId_111',
  tripId: trip,
}

export const todo = {
  _id: 'todoId_111',
  status: 'TODO',
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
