import { type ITaskRepo } from '../../models/implementations/taskRepo'
import { WfmSyncAppointmentToTaskWorker } from './wfmSyncAppointmentToTask.worker'

const taskRepo: ITaskRepo = {
  update: jest.fn(),
}

const mockConfig = {
  bootstrapServers: 'localhost:9092',
  consumerGroupId: 'test-group',
  topic: 'test',
}

function buildMockAppointmentMessage() {
  return {
    value: {
      fullDocument: {
        appointmentFrom: '2021-05-13 07:00:00.000Z',
        appointmentTo: '2021-05-13 08:00:00.000Z',
        appointmentNo: 'appointmentNo01',
      },
      updateDescription: {
        updatedFields: {
          appointmentFrom: '2021-05-13 07:00:00.000Z',
        },
      },
      operationType: 'update',
    },
  }
}

describe('Sync appointment to task worker', () => {
  const worker = new WfmSyncAppointmentToTaskWorker(mockConfig, taskRepo)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update task when operation type is update and update is interested field', () => {
    taskRepo.update.mockResolvedValue({ appointmentNo: 'appointmentNo01' })

    worker.onMessage(buildMockAppointmentMessage())

    expect(taskRepo.update).toBeCalledWith(
      { appointmentNo: 'appointmentNo01' },
      { windowTime: ['2021-05-13 07:00:00.000Z', '2021-05-13 08:00:00.000Z'] },
    )
  })

  it('should not update task when operation type is not update', () => {
    // eslint-disable-next-line prefer-const
    let appointmentMessage = buildMockAppointmentMessage()
    appointmentMessage.value.operationType = 'insert'

    worker.onMessage(appointmentMessage)

    expect(taskRepo.update).not.toHaveBeenCalled()
  })

  it('should not update task when message update not interested fields ', () => {
    // eslint-disable-next-line prefer-const
    let appointmentMessage = buildMockAppointmentMessage()
    appointmentMessage.value.updateDescription = {}

    worker.onMessage(appointmentMessage)

    expect(taskRepo.update).not.toHaveBeenCalled()
  })
})
