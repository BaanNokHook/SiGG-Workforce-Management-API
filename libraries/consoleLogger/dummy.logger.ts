import { ILogger } from './logger.interface'

export class DummyLogger implements ILogger {
  info(error: Error, ...params: any[]): void
  info(obj: Object, ...params: any[]): void
  info(obj: any, ...params: any[]) {}
  debug(error: Error, ...params: any[]): void
  debug(obj: Object, ...params: any[]): void
  debug(obj: any, ...params: any[]) {}
  warn(error: Error, ...params: any[]): void
  warn(obj: Object, ...params: any[]): void
  warn(obj: any, ...params: any[]) {}
  error(error: Error, ...params: any[]): void
  error(obj: Object, ...params: any[]): void
  error(obj: any, ...params: any[]) {}
  trace(error: Error, ...params: any[]): void
  trace(obj: Object, ...params: any[]): void
  trace(obj: any, ...params: any[]) {}
}

export const dummyLogger = new DummyLogger()
