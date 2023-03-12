// @flow

export type CallType = 'UNDEFINED' | 'CANCELED' | 'INCOMING' | 'OUTGOING' | 'MISSED'

export type CallLogInput = {
  destinationNumber: string,
  duration: number,
  startCall: string,
  type: CallType,
  taskId: string,
}
