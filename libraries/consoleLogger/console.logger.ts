import { ILogger } from './logger.interface';

export class ConsoleLogger implements ILogger {
  info(error: Error, ...params: any[]): void;
  info(obj: Object, ...params: any[]): void;
  info(obj: any, ...params: any[]) {
    console.log(obj, params)
  }
  debug(error: Error, ...params: any[]): void;
  debug(obj: Object, ...params: any[]): void;
  debug(obj: any, ...params: any[]) {
    console.log(obj, params)
  }
  warn(error: Error, ...params: any[]): void;
  warn(obj: Object, ...params: any[]): void;
  warn(obj: any, ...params: any[]) {
    console.log(obj, params)
  }
  error(error: Error, ...params: any[]): void;
  error(obj: Object, ...params: any[]): void;
  error(obj: any, ...params: any[]) {
    console.error(obj, params)
  }
  trace(error: Error, ...params: any[]): void;
  trace(obj: Object, ...params: any[]): void;
  trace(obj: any, ...params: any[]) {
    console.log(obj, params)
  }

}

export const consoleLogger = new ConsoleLogger()