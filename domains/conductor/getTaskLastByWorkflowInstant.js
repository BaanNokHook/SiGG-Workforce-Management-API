// @flow
import R from 'ramda'

// eslint-disable-next-line import/prefer-default-export
export const getTaskLastByWorkflowInstant = (workflowInstant: any) => {
  const conductorTasks = R.pathOr([], ['data', 'tasks'], workflowInstant)
  const taskLast = R.last(conductorTasks)
  return taskLast
}
