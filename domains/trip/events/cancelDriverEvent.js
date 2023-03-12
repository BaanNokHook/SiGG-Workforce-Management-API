import R from 'ramda'
import FleetHttpService from '../../../services/httpService/fleet'
import GetTripById from '../view'
import logger from '../../../libraries/logger'

const REJECT = `REJECT`

export default async (tripId, data) => {
  const trip = await GetTripById({ _id: tripId })
  const { orderId, _id, companyId, projectId, tasks, workflowInstanceId, staffs, passengers } = trip
  const prepareCancelDriver = {
    orderId,
    trip: {
      _id,
      companyId,
      projectId,
      status: REJECT,
    },
    tasks: tasks.map(task => ({ _id: task, status: REJECT })),
    passengers: R.uniq(passengers) || [],
    workflowInstanceId,
    staffId: R.head(staffs) || null,
    cancelBy: data.requestRole,
    orderStatus: data.orderStatus || '',
  }

  const cancelDriverResp = await FleetHttpService.post({
    thing: `driver/conductor/cancelDriver`,
    body: prepareCancelDriver,
  })
  logger.info({ event: 'CANCEL_DRIVER', orderId, tripId })
  return cancelDriverResp
}
