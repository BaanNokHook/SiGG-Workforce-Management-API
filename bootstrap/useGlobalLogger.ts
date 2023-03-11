import Container from 'typedi'

export default function useGlobalLogger(logger: any) {
  // register jsonLogger to di to support @Inject('logger') private logger: ILogger
  Container.set([{ id: "logger", value: logger }])
}
s