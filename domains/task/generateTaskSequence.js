// @flow
import { getNextSequence } from '../sequence/sequence'

type GenerateSequenceRequest = {
  key: string,
  expiredAt?: Date,
}

export default async (request: GenerateSequenceRequest) => {
  const { key, expiredAt } = request
  const taskSequence = await getNextSequence(key, expiredAt)
  return taskSequence
}
