// @flow
import R from 'ramda'
import { type MetadataWorkflows, type MetadataWorkflow } from './type'
import { type Todo } from '../../../models/implementations/todoRepo'

export function getTransportWorkflow(workflows: MetadataWorkflows): MetadataWorkflow {
  const transportWorkflow = workflows.find((_workflow) => {
    const [isTransportWorkflow] = R.match(
      /transport|TRANSPORT/g,
      R.pathOr('', ['workflowName'], _workflow),
    )
    return isTransportWorkflow
  })

  if (!transportWorkflow) {
    throw new Error('Cannot find transport workflow!')
  }

  return transportWorkflow
}

export function getWorkflowTaskPickup(
  workflows: MetadataWorkflows,
  taskName: string,
): MetadataWorkflow {
  const workflowTask = workflows.find((_workflowTask) => {
    const taskPickup = _workflowTask.taskName === taskName
    const [taskRefPickup] = R.match(
      /pickup|picked_up|PICKUP|PICKED_UP/g,
      R.pathOr('', ['taskReferenceName'], _workflowTask),
    )

    return taskPickup && taskRefPickup
  })

  if (!workflowTask) {
    throw new Error(`Cannot find workflow task ${taskName}`)
  }

  return workflowTask
}

export function getWorkflowTaskDelivery(
  workflows: MetadataWorkflows,
  taskName: string,
): MetadataWorkflow {
  const workflowTask = workflows.find((_workflowTask) => {
    const taskDelivery = _workflowTask.taskName === taskName
    const [taskRefDelivery] = R.match(
      /delivery|delivered|DELIVERY|DELIVERED/g,
      R.pathOr('', ['taskReferenceName'], _workflowTask),
    )

    return taskDelivery && taskRefDelivery
  })

  if (!workflowTask) {
    throw new Error(`Cannot find workflow task ${taskName}`)
  }

  return workflowTask
}

export function getWorkflowTask(workflows: MetadataWorkflows, taskName: string): MetadataWorkflow {
  const workflowTask = workflows.find((_workflowTask) => {
    const task = _workflowTask.taskName === taskName

    return task
  })

  if (!workflowTask) {
    throw new Error(`Cannot find workflow task ${taskName}`)
  }

  return workflowTask
}

type TransformTodoResponseParams = {
  taskTypeCode: string,
  todoTypeCode?: string,
  todo: Todo,
}

// improve map response message by message code later response follow wfm
type Message = {
  message: {
    message: {
      [key: string]: string,
    },
  },
}

export type TransformTodoResponse = Message & Todo

// improve map response message by message code later
export function transformTodoResponse({
  taskTypeCode = '',
  todoTypeCode = 'DEFAULT',
  todo,
}: TransformTodoResponseParams): TransformTodoResponse {
  const isTaskAcceptTrip = taskTypeCode.match('(accept_trip|acceptTrip|ACCEPT_TRIP)')
  // $flow-disable-line
  const _todo = R.type(todo.toObject) === 'Function' ? todo.toObject() : todo
  if (isTaskAcceptTrip) {
    const message = {
      message: {
        th: 'คุณได้รับงานนี้แล้ว',
      },
    }
    return {
      ..._todo,
      message,
    }
  }

  const isPickupTask = taskTypeCode.match('(pickup|pick_up|PICKUP|PICK_UP)')
  if (isPickupTask) {
    const messageByTodoTypeCode = {
      SET_OFF: 'คุณกำลังเริ่มเดินทางไปรับของ',
      CHECK_IN: 'คุณเช็คอินที่จุดรับของเรียบร้อย',
      TAKE_A_PHOTO: 'ถ่ายรูปเรียบร้อยแล้ว',
      POD: 'เพิ่มลายเซ็นแล้ว',
      PICKED_UP: 'คุณได้รับของเรียบร้อยแล้ว',
      DEFAULT: 'อัปเดทข้อมูลสำเร็จแล้ว',
    }
    const message = {
      message: {
        th: messageByTodoTypeCode[todoTypeCode],
      },
    }
    return {
      ..._todo,
      message,
    }
  }

  const isDeliveryTask = taskTypeCode.match('(delivery|DELIVERY)')
  if (isDeliveryTask) {
    const messageByTodoTypeCode = {
      SET_OFF: 'คุณกำลังเริ่มเดินทางไปส่งของ',
      CHECK_IN: 'คุณเช็คอินที่จุดส่งของเรียบร้อย',
      TAKE_A_PHOTO: 'ถ่ายรูปเรียบร้อยแล้ว',
      COLLECT_CASH: 'เก็บเงินแล้ว',
      POD: 'เพิ่มลายเซ็นแล้ว',
      DELIVERED: 'คุณได้ส่งของเรียบร้อยแล้ว',
      DEFAULT: 'อัปเดทข้อมูลสำเร็จแล้ว',
    }
    const message = {
      message: {
        th: messageByTodoTypeCode[todoTypeCode],
      },
    }
    return {
      ..._todo,
      message,
    }
  }

  const message = {
    message: {
      th: 'อัปเดทข้อมูลสำเร็จแล้ว',
    },
  }
  return {
    ..._todo,
    message,
  }
}

export const TODO_TYPE_ERROR_CODE = {
  SET_OFF: 'setOff',
  CHECK_IN: 'checkIn',
  PACKING_ITEMS: 'packingItems',
  TAKE_A_PHOTO: 'takePhoto',
  POD: 'pod',
  PICKED_UP: 'pickedUp',
  COLLECT_CASH: 'cod',
  SUMMARY: 'summary',
  RECEIPT: 'receipt',
  DELIVERED: 'delivered',
}
