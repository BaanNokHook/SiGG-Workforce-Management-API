// @flow
import { broker } from '../../../libraries/rabbitMq'
import logger from '../../../libraries/logger/index'

type TaskPayload = {
  _id: string,
  status: 'TODO' | 'DOING' | 'DONE',
}

type TripPayload = {
  _id: string,
  companyId: string,
  projectId: string,
  status: 'TODO' | 'DOING' | 'DONE',
}

type TripPayloadEvent = {
  orderId: string,
  trip: TripPayload,
  tasks: TaskPayload[],
  staffId: string,
}

const publish = `tms-service.update_transport_trip_status`

const sendToRascal = async (payload: TripPayloadEvent) => {
  try {
    const publication = await broker.publish(publish, payload)

    logger.info(
      {
        event: `publish_complete`,
        queue: publish,
      },
      JSON.stringify(payload),
    )

    publication.on('error', (errorPublish, messageId) => {
      logger.error(
        {
          err: errorPublish,
          event: `publish_error`,
          queue: publish,
          messageId,
        },
        JSON.stringify(payload),
      )
    })
  } catch (error) {
    logger.error(
      {
        err: error,
        event: 'publish_error',
        queue: publish,
      },
      JSON.stringify(payload),
    )
  }
}

export default async (data) => {
  await sendToRascal(data)
}
