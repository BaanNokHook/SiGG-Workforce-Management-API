// @flow
import logger from '../../../libraries/logger'
import type { CallLogInput } from './type'
import ThrowError from '../../../error/basic'
import bulkPush from '../bulkPush'

export class CallLogsDomain {
  constructor() {
    this.logger = logger
  }

  validate(data: CallLogInput[]): void {
    if (!Array.isArray(data) || data.length < 1) {
      throw ThrowError.FIELD_IS_INVALID('data must be array with at least one element.')
    }
  }

  async save(callLogs: CallLogInput[]): Promise<any> {
    this.logger.info({ event: 'save-callLogs', input: JSON.stringify(callLogs) })

    this.validate(callLogs)

    const input = callLogs.map((callLog: CallLogInput) => ({
      data: { 'metadata.callLogs': callLog },
      _id: callLog.taskId,
    }))

    const results = await bulkPush(input)

    return results
  }
}
