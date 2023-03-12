// @flow
import {
  Admin,
  IAdminConfig,
  ITaskRef,
  TaskStates,
  WorkflowDefinition,
} from '@melonade/melonade-client'
import logger from '../logger/index'

export interface IWorkflow {
  complete(task: ITaskRef, output: any): void;
  failed(task: ITaskRef, output: any): void;
  start(
    transactionId: string,
    workflowRef: WorkflowDefinition.IWorkflowRef,
    input: any,
    tags?: string[],
  ): void;
}

export class MelonadeProducer implements IWorkflow {
  static instance: MelonadeProducer
  config: IAdminConfig
  adminClient: Admin

  constructor(config: IAdminConfig) {
    this.config = config
    this.adminClient = new Admin(config, {})
    this.adminClient.on('ready', () => {
      logger.info(
        { event: 'melonade_producer_ready' },
        `${config.kafkaServers} : ${config.namespace}`,
      )
    })
  }

  complete(task: ITaskRef, output: any) {
    const logMetadata = {
      event: 'update_workflow_task_to_complete',
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
    }
    try {
      this.adminClient.updateTask(task, {
        status: TaskStates.Completed,
        updateAt: new Date(),
        output,
      })
      logger.info(logMetadata, JSON.stringify(task))
    } catch (error) {
      logger.error({ err: error, ...logMetadata }, JSON.stringify(task))
      throw new Error('Cannot update workflow task to complete')
    }
  }

  failed(task: ITaskRef, output: any) {
    const logMetadata = {
      event: 'update_workflow_task_to_failed',
      workflowTransactionId: task.transactionId,
      workflowTaskId: task.taskId,
    }
    try {
      this.adminClient.updateTask(task, { status: TaskStates.Failed, updateAt: new Date(), output })
      logger.info(logMetadata, JSON.stringify(task))
    } catch (error) {
      logger.error({ err: error, ...logMetadata }, JSON.stringify(task))
      throw new Error('Cannot update workflow task to failed')
    }
  }

  start(
    transactionId: string,
    workflowRef: WorkflowDefinition.IWorkflowRef,
    input: any,
    tags?: string[],
  ) {
    const logMetadata = {
      event: `start_workflow_${workflowRef.name}`.toLowerCase(),
      workflowTransactionId: transactionId,
      workflowName: workflowRef.name,
    }
    const metadata = {
      transactionId,
      workflowRef,
      input,
      tags,
    }
    try {
      this.adminClient.startTransaction(transactionId.toString(), workflowRef, input, tags)
      logger.info(logMetadata, JSON.stringify(metadata))
    } catch (error) {
      logger.error({ err: error, ...logMetadata }, JSON.stringify(metadata))
      throw new Error(`start workflow ${workflowRef.name} failed`)
    }
  }
}
