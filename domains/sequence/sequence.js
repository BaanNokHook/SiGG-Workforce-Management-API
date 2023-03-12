// @flow
import { builder } from '../../models/sequence.repository'

export type IGetNextSequence = (key: string, expiredAt?: Date) => string

export async function getNextSequence(key: string, expiredAt?: Date) {
  const next = await builder.Model.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 }, $setOnInsert: { expiredAt } },
    { upsert: true, new: true },
  )
  return next.seq
}
