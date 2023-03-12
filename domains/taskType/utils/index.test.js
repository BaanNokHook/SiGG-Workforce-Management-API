import {
  getTransportWorkflow,
  getWorkflowTaskPickup,
  getWorkflowTaskDelivery,
  transformTodoResponse,
} from './index'
import {
  metadataWorkflow,
  transportWorkflow,
  metadataWorkflowWithoutWorkflowTransport,
  setoffPickupTask,
  checkInPickUpTask,
  takePhotoPickUpTask,
  signSignaturePickUpTask,
  pickedUpTask,
  setoffDeliveryTask,
  checkInDeliveryTask,
  collectCashDeliveryTask,
  takePhotoDeliveryTask,
  signSignatureDeliveryTask,
  deliveredTask,
  metadataWorkflowWithoutTransportTask,
  todo,
} from './index.mock'

describe('Get transport information', () => {
  it('Should get information', () => {
    const result = getTransportWorkflow(metadataWorkflow)

    expect(result).toEqual(transportWorkflow)
  })

  it(`Should throw error can't find transport workflow`, () => {
    function cannotFindTransportWorkflow() {
      return getTransportWorkflow(metadataWorkflowWithoutWorkflowTransport)
    }

    expect(cannotFindTransportWorkflow).toThrow()
  })
})

describe('Get workflow task pickup information', () => {
  it('Should get task setoff pickup', () => {
    const result = getWorkflowTaskPickup(metadataWorkflow, 'tms_todo_setoff')

    expect(result).toEqual(setoffPickupTask)
  })

  it('Should get task checkin pickup', () => {
    const result = getWorkflowTaskPickup(metadataWorkflow, 'tms_todo_checkin')

    expect(result).toEqual(checkInPickUpTask)
  })

  it('Should get task take photo pickup', () => {
    const result = getWorkflowTaskPickup(metadataWorkflow, 'tms_todo_take_photo')

    expect(result).toEqual(takePhotoPickUpTask)
  })

  it('Should get task sign signature pickup', () => {
    const result = getWorkflowTaskPickup(metadataWorkflow, 'tms_todo_sign_signature')

    expect(result).toEqual(signSignaturePickUpTask)
  })

  it('Should get task take pickedup pickup', () => {
    const result = getWorkflowTaskPickup(metadataWorkflow, 'tms_todo_picked_up')

    expect(result).toEqual(pickedUpTask)
  })

  it(`Should throw error can't find workflow task`, () => {
    function cannotFindWorkflowTask() {
      return getWorkflowTaskPickup(metadataWorkflowWithoutTransportTask, 'tms_todo_picked_up')
    }

    expect(cannotFindWorkflowTask).toThrow('Cannot find workflow task tms_todo_picked_up')
  })
})

describe('Get workflow task delivery information', () => {
  it('Should get task setoff delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_setoff')

    expect(result).toEqual(setoffDeliveryTask)
  })

  it('Should get task checkin delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_checkin')

    expect(result).toEqual(checkInDeliveryTask)
  })

  it('Should get task collect cash delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_collect_cash')

    expect(result).toEqual(collectCashDeliveryTask)
  })

  it('Should get task take photo delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_take_photo')

    expect(result).toEqual(takePhotoDeliveryTask)
  })

  it('Should get task sign signature delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_sign_signature')

    expect(result).toEqual(signSignatureDeliveryTask)
  })

  it('Should get task take pickedup delivery', () => {
    const result = getWorkflowTaskDelivery(metadataWorkflow, 'tms_todo_delivered')

    expect(result).toEqual(deliveredTask)
  })

  it(`Should throw error can't find workflow task`, () => {
    function cannotFindWorkflowTask() {
      return getWorkflowTaskDelivery(metadataWorkflowWithoutTransportTask, 'tms_todo_delivered')
    }

    expect(cannotFindWorkflowTask).toThrow('Cannot find workflow task tms_todo_delivered')
  })
})

describe('Transform Todo Response', () => {
  it('Todo accept trip  should return message "คุณได้รับงานนี้แล้ว"', () => {
    const result = transformTodoResponse({ taskTypeCode: 'ACCEPT_TRIP', todo })

    expect(result.message.message.th).toEqual('คุณได้รับงานนี้แล้ว')
  })

  it('Todo check in task pickup should return message "คุณเช็คอินที่จุดรับของเรียบร้อย"', () => {
    const result = transformTodoResponse({ taskTypeCode: 'PICKUP', todoTypeCode: 'CHECK_IN', todo })

    expect(result.message.message.th).toEqual('คุณเช็คอินที่จุดรับของเรียบร้อย')
  })

  it('Todo setoff task delivery should return message "คุณกำลังเริ่มเดินทางไปส่งของ"', () => {
    const result = transformTodoResponse({
      taskTypeCode: 'DELIVERY',
      todoTypeCode: 'SET_OFF',
      todo,
    })

    expect(result.message.message.th).toEqual('คุณกำลังเริ่มเดินทางไปส่งของ')
  })

  it('Invalid task type should return message "อัปเดทข้อมูลสำเร็จแล้ว"', () => {
    const result = transformTodoResponse({
      taskTypeCode: 'XXX',
      todoTypeCode: 'SET_OFF',
      todo,
    })

    expect(result.message.message.th).toEqual('อัปเดทข้อมูลสำเร็จแล้ว')
  })
})
