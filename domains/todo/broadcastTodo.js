// @flow
import R from 'ramda'
import broadcastService from '../../services/httpService/broadcast'

type UserGroup = {
  passengers: string[],
  staffs: string[],
}

export default async (userGroup: UserGroup, todo: any, options = {}) => {
  const { isUser = false, broadcastPayload } = todo
  const { payload = {}, strategy, timeoutPerMessage = 15000 } = broadcastPayload
  const staffIds = R.uniq(userGroup.staffs)
  const passengersIds = R.uniq(userGroup.passengers)
  /** isUser == true is  todo interaction with myself */
  /** isUser == false is  todo not interaction with myself */
  const userIds = isUser ? staffIds : passengersIds

  const prepareBodyRequest = {
    userId: userIds,
    data: payload,
    strategy,
    timeoutPerMessage,
  }

  const broadcastResponse = await broadcastService.post({
    thing: 'v1/broadcast',
    body: prepareBodyRequest,
  })
  return R.path(['data', 'data'], broadcastResponse)
}
