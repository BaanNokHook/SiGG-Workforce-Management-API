import { GenerateSequenceId } from './generateSequenceId'
import { getNextSequence } from '../sequence/sequence'

export const generateSequenceId = new GenerateSequenceId(getNextSequence)
