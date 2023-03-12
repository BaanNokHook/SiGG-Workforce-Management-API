export const metadataWorkflow = [
  {
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
    transactionPrefix: 'transport-',
    workflowName: 'ODM_TRANSPORT',
    workflowRev: 1,
    workflowInput: {},
    taskId: '',
    taskName: '',
    taskReferenceName: '',
    workflowId: '',
  },
  {
    taskId: '4b279270-35d4-4402-9f56-d3c9be381899',
    taskName: 'tms_todo_setoff',
    taskReferenceName: 'odm_tms_todo_setoff_pickup',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: '0028ee7a-d84e-4b35-ade0-023dcab63f6e',
    taskName: 'tms_todo_checkin',
    taskReferenceName: 'odm_tms_todo_checkin_pickup',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: 'fbf87ce2-b01a-4fdf-9f3c-00bbe2109482',
    taskName: 'tms_todo_take_photo',
    taskReferenceName: 'odm_tms_todo_take_photo_pickup',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: 'c4fd9316-2095-43fe-a750-53e5253f2809',
    taskName: 'tms_todo_sign_signature',
    taskReferenceName: 'odm_tms_todo_sign_signature_pickup',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: 'ed3f9d93-345c-4be2-8d26-346ec46cd8bb',
    taskName: 'tms_todo_picked_up',
    taskReferenceName: 'odm_tms_todo_picked_up',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: '121ec95c-a8ce-42ca-a5f1-93537c4a68fb',
    taskName: 'tms_todo_setoff',
    taskReferenceName: 'odm_tms_todo_setoff_delivery',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: 'f2db82bc-d116-4b2b-841f-af41cf932002',
    taskName: 'tms_todo_checkin',
    taskReferenceName: 'odm_tms_todo_checkin_delivery',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: '6ffe6b7b-7227-44c4-98c1-ee0209b1f6f5',
    taskName: 'tms_todo_take_photo',
    taskReferenceName: 'odm_tms_todo_take_photo_delivery',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: '992b39f9-e551-466e-a691-250e632d17ec',
    taskName: 'tms_todo_sign_signature',
    taskReferenceName: 'odm_tms_todo_sign_signature_delivery',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: 'b6d846ea-6975-4392-bbc9-045b1a778360',
    taskName: 'tms_todo_collect_cash',
    taskReferenceName: 'odm_tms_todo_collect_cash_delivery',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
  {
    taskId: '43e0878f-273e-497e-89dc-746eecf2365e',
    taskName: 'tms_todo_delivered',
    taskReferenceName: 'odm_tms_todo_delivered',
    workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  },
]

export const metadataWorkflowWithoutTransportTask = [
  {
    transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
    transactionPrefix: 'transport-',
    workflowName: 'ODM_TRANSPORT',
    workflowRev: 1,
    workflowInput: {},
    taskId: '',
    taskName: '',
    taskReferenceName: '',
    workflowId: '',
  },
]

export const metadataWorkflowWithoutWorkflowTransport = [
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
]

export const transportWorkflow = {
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
  transactionPrefix: 'transport-',
  workflowName: 'ODM_TRANSPORT',
  workflowRev: 1,
  workflowInput: {},
  taskId: '',
  taskName: '',
  taskReferenceName: '',
  workflowId: '',
}

export const setoffPickupTask = {
  taskId: '4b279270-35d4-4402-9f56-d3c9be381899',
  taskName: 'tms_todo_setoff',
  taskReferenceName: 'odm_tms_todo_setoff_pickup',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const checkInPickUpTask = {
  taskId: '0028ee7a-d84e-4b35-ade0-023dcab63f6e',
  taskName: 'tms_todo_checkin',
  taskReferenceName: 'odm_tms_todo_checkin_pickup',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const takePhotoPickUpTask = {
  taskId: 'fbf87ce2-b01a-4fdf-9f3c-00bbe2109482',
  taskName: 'tms_todo_take_photo',
  taskReferenceName: 'odm_tms_todo_take_photo_pickup',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const signSignaturePickUpTask = {
  taskId: 'c4fd9316-2095-43fe-a750-53e5253f2809',
  taskName: 'tms_todo_sign_signature',
  taskReferenceName: 'odm_tms_todo_sign_signature_pickup',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const pickedUpTask = {
  taskId: 'ed3f9d93-345c-4be2-8d26-346ec46cd8bb',
  taskName: 'tms_todo_picked_up',
  taskReferenceName: 'odm_tms_todo_picked_up',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const setoffDeliveryTask = {
  taskId: '121ec95c-a8ce-42ca-a5f1-93537c4a68fb',
  taskName: 'tms_todo_setoff',
  taskReferenceName: 'odm_tms_todo_setoff_delivery',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const checkInDeliveryTask = {
  taskId: 'f2db82bc-d116-4b2b-841f-af41cf932002',
  taskName: 'tms_todo_checkin',
  taskReferenceName: 'odm_tms_todo_checkin_delivery',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const collectCashDeliveryTask = {
  taskId: 'b6d846ea-6975-4392-bbc9-045b1a778360',
  taskName: 'tms_todo_collect_cash',
  taskReferenceName: 'odm_tms_todo_collect_cash_delivery',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const takePhotoDeliveryTask = {
  taskId: '6ffe6b7b-7227-44c4-98c1-ee0209b1f6f5',
  taskName: 'tms_todo_take_photo',
  taskReferenceName: 'odm_tms_todo_take_photo_delivery',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const signSignatureDeliveryTask = {
  taskId: '992b39f9-e551-466e-a691-250e632d17ec',
  taskName: 'tms_todo_sign_signature',
  taskReferenceName: 'odm_tms_todo_sign_signature_delivery',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const deliveredTask = {
  taskId: '43e0878f-273e-497e-89dc-746eecf2365e',
  taskName: 'tms_todo_delivered',
  taskReferenceName: 'odm_tms_todo_delivered',
  workflowId: 'e5b1a27d-196a-4d1e-854b-0188ffc0493e',
  transactionId: '666206a0-7499-11ea-a7db-01cee8ef9f6e-1',
}

export const todo = {
  _id: 'todo_id',
}
