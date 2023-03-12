// @flow

export type TaskInstant = {
  taskType: string,
  status: string,
  inputData: any,
  referenceTaskName: string,
  retryCount: number,
  seq: number,
  pollCount: number,
  taskDefName: string,
  scheduledTime: number,
  startTime: number,
  endTime: number,
  updateTime: number,
  startDelayInSeconds: number,
  retried: boolean,
  executed: boolean,
  callbackFromWorker: boolean,
  responseTimeoutSeconds: number,
  workflowInstanceId: string,
  workflowType: string,
  taskId: string,
  callbackAfterSeconds: number,
  outputData: string[],
  workflowTask: string[],
  rateLimitPerFrequency: number,
  rateLimitFrequencyInSeconds: number,
  workflowPriority: number,
  taskDefinition: string[],
  queueWaitTime: number,
  taskStatus: string,
}

export type WorkflowInstant = {
  createTime: number,
  updateTime: number,
  status: string,
  endTime: number,
  tasks: TaskInstant[],
  workflowId: string,
  input: {},
  workflowType: string,
  version: number,
  schemaVersion: number,
  workflowDefinition: WorkflowDefinition,
  priority: number,
  startTime: number,
  workflowName: string,
  workflowVersion: number,
}

export type WorkflowDefinition = {
  updateTime: number,
  name: string,
  description: string,
  version: number,
  tasks: TaskInstant[],
  failureWorkflow: string,
  schemaVersion: number,
  restartable: boolean,
  workflowStatusListenerEnabled: boolean,
}
