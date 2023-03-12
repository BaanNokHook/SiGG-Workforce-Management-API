import R from 'ramda'
import TripRepository from '../../models/trip.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'
import logger from '../../libraries/logger'

const validate = {
  tripId: true,
}

export default async function updateMetadataWorkflow(tripId: string, data: any) {
  isRequiredField({ tripId }, validate)

  try {
    const trip = await checkFindOne(TripRepository, { _id: tripId })
    let metadata = R.path(['metadata'], trip)
    if (!metadata) {
      metadata = {}
      metadata.workflows = [data]
    } else if (!metadata.workflows) {
      metadata.workflows = [data]
    } else {
      metadata.workflows.push(data)
    }
    const tripUpdated = await TripRepository.update({ _id: tripId }, { metadata }, { new: true })

    return tripUpdated
  } catch (error) {
    logger.error({ err: error, event: 'update_workflow_metadata' })
    throw new Error(`Update metadata of trip error`)
  }
}
