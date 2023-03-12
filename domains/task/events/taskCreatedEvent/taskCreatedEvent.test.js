import { TaskCreatedEvent } from './index'

describe('TaskCreatedEvent should work correctly', () => {
  process.env = Object.assign(process.env, {
    WFM_PROJECT_ID: '5cf0ad79b603c7605955bc7f',
    ...process.env,
  })
  const cfmTaskCreatedEventHandler = {
    updateToCFM: jest.fn(),
  }
  const taskCreatedEvent = new TaskCreatedEvent(cfmTaskCreatedEventHandler)

  it('method executeHandlers. should call project wfm handlers correctly', () => {
    const task = {
      projectId: '5cf0ad79b603c7605955bc7f',
    }
    taskCreatedEvent.executeHandlers(task)
    expect(cfmTaskCreatedEventHandler.updateToCFM).toHaveBeenCalled()
  })

  it('method executeHandlers. should not call cfmTaskCreatedEventHandler if project is not wfm', () => {
    const task = {
      projectId: 'project',
    }
    taskCreatedEvent.executeHandlers(task)
    expect(cfmTaskCreatedEventHandler.updateToCFM).not.toHaveBeenCalled()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
