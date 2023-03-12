import { ITask, ITaskResponse } from '@melonade/melonade-client'

export interface IMelonadeWorker {
  taskName: string;
  process: (task: ITask) => Promise<ITaskResponse>;
  compensate: (task: ITask) => Promise<ITaskResponse>;
}

export interface IMelonadeConfig {
  servers: string;
  namespace: string;
}

export const logActions = {
  processStarted: 'process_started',
  processCompleted: 'process_completed',
  processFailed: 'process_failed',
  compensateStarted: 'compensate_started',
  compensateCompleted: 'compensate_completed',
  compensateFailed: 'compensate_failed',
}
