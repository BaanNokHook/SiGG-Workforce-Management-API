// @flow
import R from 'ramda'
import moment from 'moment'
import { type IGetNextSequence } from '../sequence/sequence'
import { addLeadingZero } from '../../utils/addLeadingZero'

function getAcceptTripReferenceIdExited(tripMetadata?: any) {
  if (!tripMetadata) return null

  return R.path(['acceptTripReferenceId'], tripMetadata)
}

export class GenerateSequenceId {
  getNextSequence: IGetNextSequence

  constructor(getNextSequence: IGetNextSequence) {
    this.getNextSequence = getNextSequence
  }

  async generateId(prefix: string = 'REF', runningNumberLength: number = 3, expiredAt?: Date) {
    const sequence = await this.getNextSequence(prefix, expiredAt)
    const randomNumber = addLeadingZero(sequence, runningNumberLength)
    return `${prefix}${randomNumber}`
  }

  getMountPrefix(date: Date) {
    const mount = moment(date).format('MMM')
    return `${mount}`.toUpperCase()
  }

  async acceptTripReferenceId(
    tripMetadata: any,
    runningNumberLength?: number = 5,
    expiredAt?: Date = moment().endOf('month'),
  ) {
    const acceptTripReferenceId = getAcceptTripReferenceIdExited(tripMetadata)
    if (acceptTripReferenceId) return acceptTripReferenceId

    const prefix = this.getMountPrefix(expiredAt)
    const _acceptTripReferenceId = await this.generateId(prefix, runningNumberLength, expiredAt)
    return _acceptTripReferenceId
  }
}
