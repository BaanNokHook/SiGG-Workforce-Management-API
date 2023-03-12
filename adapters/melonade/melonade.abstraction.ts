import {
  Admin,
  ITask,
  ITaskResponse,
  TaskStates,
  Worker,
} from '@melonade/melonade-client';
import { Inject } from 'typedi';
import { config } from '../../bootstrapConfig';
import { ILogger } from '../../libraries/logger/logger.interface';
import { consoleLogger } from '../../logger';

const kafkaServers = config.kafka.MELONADE_KAFKA_BROKERS || '0.0.0.0:9092';
const namespace = config.kafka.MELONADE_NAMESPACE;

export const melonadeAdminClient = new Admin({
  kafkaServers,
  namespace,
});

export abstract class MelonadeAbstraction {
  abstract readonly taskName: string;
  abstract process(task: ITask): Promise<ITaskResponse>;
  abstract compensate(task: ITask): Promise<ITaskResponse>;

  constructor(@Inject('logger') public logger: ILogger = consoleLogger) {}

  workerCompleted(output?: any): ITaskResponse {
    return {
      status: TaskStates.Completed,
      output: output,
    };
  }

  workerFailed(output?: any): ITaskResponse {
    return {
      status: TaskStates.Failed,
      output: output,
    };
  }

  workerInProgress(output?: any): ITaskResponse {
    return {
      status: TaskStates.Inprogress,
      output: output,
    };
  }

  start() {
    console.log(`${this.taskName} worker started!`);
    const workerInstance = new Worker(
      this.taskName,
      (task: ITask) => this.process(task),
      (task: ITask) => this.compensate(task),
      {
        kafkaServers,
        namespace,
      },
    );

    workerInstance.once('ready', () => {
      this.logger.info({
        event: `REGISTER_WORKER_${this.taskName.toUpperCase()}`,
      });
    });

    return workerInstance;
  }
}
