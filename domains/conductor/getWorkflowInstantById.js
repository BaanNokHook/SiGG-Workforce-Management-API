// @flow
import { conductorClient } from '../../libraries/conductor/index'

export default async function getWorkflowById(workflowInstantId: string) {
  const workflowInstant = await conductorClient.getWorkflow(workflowInstantId, true)
  return workflowInstant
}
