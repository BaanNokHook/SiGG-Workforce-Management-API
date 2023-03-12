declare module 'hpropagate' {
  const hpropagate: (overrides?: {
    setAndPropagateCorrelationId?: boolean,
    propagateInResponses?: boolean,
    headersToPropagate?: string[]
  }) => void
  export default hpropagate
}

declare module 'hpropagate/lib/tracer' {
  export interface ICurrentTrace {
    context: Map<any, any>
  }

  export interface ILocalTracer {
    currentTrace?: ICurrentTrace
    traces: object
    newTrace: (type: string) => ICurrentTrace
  }

  const tracer: ILocalTracer
  export default tracer
}