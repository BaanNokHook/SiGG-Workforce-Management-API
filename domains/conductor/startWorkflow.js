import R from 'ramda'
import { isRequiredField } from '../../utils/domain'
import { conductorClient } from '../../libraries/conductor'

type StartWorkflow = {
  workflowName: String,
  data: {},
}

const validate = {
  workflowName: true,
  data: true,
}

/**
 * @param body = { workflowName = "Flow Name Target" , data = { orders from oms  }}
 */

export default async (body: StartWorkflow) => {
  isRequiredField(body, validate)
  const startFlow = await conductorClient.startWorkflow(body.workflowName, body.data)
  return {
    message: `Running working ${body.workflowName}`,
    workflowInstanceId: R.path(['data'], startFlow),
  }
}
