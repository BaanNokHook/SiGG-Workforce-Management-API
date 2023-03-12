import { ITask, Worker as ClientWorker } from '@melonade/melonade-client'
import fg from 'fast-glob'
import * as path from 'path'
import logger from '../../libraries/logger'
import { IMelonadeWorker, IMelonadeConfig } from './worker.interface'

export class MelonadeWorker {
  workerPaths: string[]
  melonadeConfig: IMelonadeConfig

  constructor(workerPaths: string[], melonadeConfig: IMelonadeConfig) {
    this.workerPaths = workerPaths
    this.melonadeConfig = melonadeConfig
  }

  createWorker(worker: IMelonadeWorker) {
    const _worker = new ClientWorker(
      worker.taskName,
      (task: ITask) => worker.process(task),
      (task: ITask) => worker.compensate(task),
      {
        kafkaServers: this.melonadeConfig.servers,
        namespace: this.melonadeConfig.namespace,
      },
    )

    _worker.once('ready', () => {
      logger.info('[MELONADE-CLIENT-CONNECTION]', `worker ${worker.taskName} is ready`)
    })
  }

  async autoLoadWorker(): IMelonadeWorker[] {
    const files = await fg(this.workerPaths, { dot: true })
    return files.map((file) => {
      const { default: Worker } = require(file)
      return new Worker()
    })
  }

  async initial() {
    try {
      const workers = await this.autoLoadWorker()
      workers.forEach((worker: IMelonadeWorker) => {
        this.createWorker(worker)
      })
    } catch (error) {
      logger.error('[MELONADE-CLIENT] start failed.', error)
      process.exit(1)
    }
  }
}
