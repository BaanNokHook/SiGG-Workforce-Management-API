// @flow
import R from 'ramda'
import RejectRepository from '../../models/reject.repository'
import TripRejectedEvent from './events/tripRejectedEvent'
import logger from '../../libraries/logger'

type RejectCreate = {
  remark: string,
  staffId: string,
  referenceId: string,
  referenceType: string,
  requestDate: string,
  projectId: string,
  companyId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
  extensionFlow: any,
}

export default async (data: RejectCreate) => {
  const { extensionFlow, remark } = data
  const { orderReturn } = extensionFlow
  const _remark = remark
    ? orderReturn.find((item) => item.id === remark)
    : orderReturn.find((item) => item.default === true)

  const rejectCreated = await RejectRepository.create({
    ...R.omit(['extensionFlow'], data),
    extensionFlow: R.path(['extensionFlow', '_id'], data),
    note: R.pathOr('', ['title', 'th'], _remark),
    refs: _remark,
  })

  await TripRejectedEvent(data.referenceId, rejectCreated)
  logger.info({ event: 'REJECT_TRIP', referenceId: data.referenceId })
  return rejectCreated
}
