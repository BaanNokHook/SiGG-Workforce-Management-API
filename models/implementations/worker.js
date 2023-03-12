// @flow

export interface IWorkflow {
  complete(): void;
  failed(): void;
  start(): void;
}

export class Worker implements IWorkflow {
  complete() {}
  failed() {}
  start() {}
}
