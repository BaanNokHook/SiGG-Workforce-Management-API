import * as R from 'ramda'
import cfmTaskCreatedEventHandler from './handlers/cfmTaskCreatedEventHandler'

export class TaskCreatedEvent {
  constructor(_cfmTaskCreatedEventHandler) {
    const { WFM_PROJECT_ID } = process.env
    this.projectHandlers = {
      [WFM_PROJECT_ID]: [task => _cfmTaskCreatedEventHandler.updateToCFM(task)],
    }
  }

  executeHandlers(task) {
    const { projectId } = task
    const _projectHandlers = this.projectHandlers[projectId]
    const isProjectHasHandlers = !R.isNil(_projectHandlers) && !R.isEmpty(_projectHandlers)
    if (isProjectHasHandlers) {
      // execute handlers by project
      _projectHandlers.map(handler => handler(task))
    }
  }
}

export default new TaskCreatedEvent(cfmTaskCreatedEventHandler)
