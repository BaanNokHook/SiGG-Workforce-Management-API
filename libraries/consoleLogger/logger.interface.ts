export type LogType = 'info' | 'debug' | 'warn' | 'trace' | 'error'

export interface ILogger {
  info(error: Error, ...params: any[]): void
  info(obj: Object, ...params: any[]): void

  debug(error: Error, ...params: any[]): void
  debug(obj: Object, ...params: any[]): void

  warn(error: Error, ...params: any[]): void
  warn(obj: Object, ...params: any[]): void

  error(error: Error, ...params: any[]): void
  error(obj: Object, ...params: any[]): void

  trace(error: Error, ...params: any[]): void
  trace(obj: Object, ...params: any[]): void

}