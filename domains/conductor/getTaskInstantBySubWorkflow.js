// @flow
import R from 'ramda'
import getWorkflowById from './getWorkflowInstantById'
import { getTaskLastByWorkflowInstant } from './getTaskLastByWorkflowInstant'

const SUB_WORKFLOW = `SUB_WORKFLOW`

// eslint-disable-next-line import/prefer-default-export
export const getTaskInstantBySubWorkflow = async (taskInstant: any) => {
  let taskInstantLast = null
  if (R.path(['taskType'], taskInstant) === SUB_WORKFLOW) {
    const subWorkflowId = R.path(['outputData', 'subWorkflowId'], taskInstant)
    const workflowInstant = await getWorkflowById(subWorkflowId)
    taskInstantLast = getTaskLastByWorkflowInstant(workflowInstant)
  } else {
    taskInstantLast = taskInstant
  }

  return taskInstantLast
}
