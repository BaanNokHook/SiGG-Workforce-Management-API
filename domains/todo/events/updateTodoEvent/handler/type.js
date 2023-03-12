export type UpdateTodoCFMType = {
  todo: any,
  result: any,
  user: any,
}

export const TodoTypes = {
  ACCEPT_TASK: 'ACCEPT_TASK',
  SET_OFF: 'SET_OFF',
  ENTER_SITE: 'ENTER_SITE',
  TAKE_A_PHOTO: 'TAKE_A_PHOTO',
  E2E: 'E2E',
  E_SIGNATURE: 'E_SIGNATURE',
  LEAVE_TASK: 'LEAVE_TASK',
  LEAVE_TASK_ASSISTANT: 'LEAVE_TASK_ASSISTANT',
  SERVICE_LIST: 'SERVICE_LIST',
  SWAP_ICC: 'SWAP_ICC',
  SWAP_CPE: 'SWAP_CPE',
}

export const ActionTypesCFM = {
  SET_OFF: 'Set Off',
  ENTER_SITE: 'Entersite',
  PROCESSED: 'Processed',
  FINISHED: 'Finished',
}

export const TaskCreator = {
  TRUE_CFM: 'TRUE_CFM',
  SCCD: 'SCCD',
}
