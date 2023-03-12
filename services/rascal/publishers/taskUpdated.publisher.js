// @flow
import { broker } from '../../../libraries/rabbitMq'
import logger from '../../../libraries/logger/index'
import { type Task } from '../../../models/implementations/taskRepo'

const publish = `4pl-tms.task_updated`

const sendToRascal = async (payload: Task) => {
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
          event: `publish_error`,
          messageId,
          err: errorPublish,
        },
        JSON.stringify(payload),
      )
    })
  } catch (error) {
    logger.error(
      {
        event: 'publish_error',
        queue: publish,
        message: `Failure Publish`,
        err: error,
      },
      JSON.stringify(payload),
    )
  }
}

export default async (data) => {
  await sendToRascal(data)
}
