import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { SyncCloseWorkOrderToTaskWorker } from './syncCloseWorkOrderToTask.worker'

const taskRepo: ITaskRepo = {
  update: jest.fn(),
}

const mockConfig = {
  bootstrapServers: 'localhost:9092',
  consumerGroupId: 'test-group',
  topic: 'test',
}

function buildMockCloseWorkOrder() {
  return {
    value: {
      fullDocument: {
        status: 'COMPLETED',
        requestNo: 'requestNo-test',
        workOrderNo: 'workOrderNo-test',
        refWorkOrderNo: 'refWorkOrderNo-test',
        requestCode: 'xx',
        closeCode: 'C01',
        reasonCode: 'xx',
        testSignalPass: 'testSignalPass-test',
        remark: 'remark-test',
        attributeList: [],
        imageList: [],
        snAttributeList: [],
      },
      operationType: 'update',
    },
  }
}

describe('Sync close work order to task worker', () => {
  const worker = new SyncCloseWorkOrderToTaskWorker(mockConfig, taskRepo)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update task when operation type is insert', () => {
    taskRepo.update.mockResolvedValue({ appointmentNo: 'appointmentNo01' })

    worker.onMessage(buildMockCloseWorkOrder())

    expect(taskRepo.update).toBeCalledWith(
      {
        orderId: 'workOrderNo-test',
        deleted: false,
      },
      {
        $set: {
          'information.closeWorkOrderResult': {
            success: true,
            refWorkOrderNo: 'refWorkOrderNo-test',
            closeCode: 'C01',
            requestCode: 'xx',
            reasonCode: 'xx',
            testSignalPass: 'testSignalPass-test',
            remark: 'remark-test',
            attributeList: [],
            imageList: [],
            snAttributeList: [],
          },
          'metadata.isLeavable': true,
        },
      },
    )
  })

  it('should not update task when operation type is not update', () => {
    // eslint-disable-next-line prefer-const
    let closeWorkOrderMsg = buildMockCloseWorkOrder()
    closeWorkOrderMsg.value.operationType = 'insert'

    worker.onMessage(closeWorkOrderMsg)

    expect(taskRepo.update).not.toHaveBeenCalled()
  })

  it('should not update task when message workOrderNo is empty ', () => {
    // eslint-disable-next-line prefer-const
    let closeWorkOrderMsg = buildMockCloseWorkOrder()
    closeWorkOrderMsg.value.fullDocument.workOrderNo = ''

    worker.onMessage(closeWorkOrderMsg)

    expect(taskRepo.update).not.toHaveBeenCalled()
  })

  it('should not update task when status is not COMPLETED ', () => {
    // eslint-disable-next-line prefer-const
    let closeWorkOrderMsg = buildMockCloseWorkOrder()
    closeWorkOrderMsg.value.fullDocument.status = 'IN_PROGRESS'

    worker.onMessage(closeWorkOrderMsg)

    expect(taskRepo.update).toBeCalledTimes(1)
  })
})
