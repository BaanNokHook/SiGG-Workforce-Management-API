import R from 'ramda'
import debug from 'debug'
import config from '../../../config'
import TaskRepository from '../../../models/task.repository'
import { checkUpdate } from '../../../utils/domain'
import { createStaff } from '../../../utils/staff.util'

let subscription
const sub = `more_staff_request_is_approved`
const log = debug(`app:rascal:${sub}`)

const handler = async (message, content, ackOrNack) => {
  // calculateFlow()
  if (R.path(['staffs'], content)) {
    const getStaff = R.path(['staffs'], content)
    const getTaskId = R.path(['content', 'taskId'], content)
    const newStaff = await createStaff({
      ...getStaff,
      referenceId: getStaff._id,
    })

    await checkUpdate(
      TaskRepository,
      {
        _id: getTaskId,
      },
      {
        $addToSet: { staffs: newStaff && newStaff._id },
      },
    )
    ackOrNack()
  }
}

const init = async (broker) => {
  try {
    subscription = await broker.subscribe(sub)
    log(`Success ${config.system.env}.${sub}`)
    subscription
      .on('message', async (message, content, ackOrNack) => {
        try {
          log(`Success Receive Message from ${config.system.env}.${sub}`)
          await handler(message, content, ackOrNack)
        } catch (error) {
          log(`${error}`)
          ackOrNack()
        }
      })
      .on('error', () => {
        log(`Error Receive Message from ${config.system.env}.${sub}`)
      })
  } catch (error) {
    log(`${error}`)
  }
}

export { subscription, init }
