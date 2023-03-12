import { MelonadeConfig } from '../../config/melonade'
import { MelonadeProducer } from '../../libraries/melonade/melonadeProducer'

export const workflow: IWorkflow = new MelonadeProducer(MelonadeConfig)
