// @flow
import moment from 'moment'
import taskRepository from '../../models/task.repository'
import rejectRepository from '../../models/reject.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  taskId: true,
  requestBy: true,
  requestRole: true,
  remark: true,
}
export default async (body: any) => {
  isRequiredField(body, validate)
  const { taskId, requestRole, requestBy, remark } = body
  const task = await checkFindOne(taskRepository, { _id: taskId })
  const { customer, projectId, companyId } = task
  const reject = await rejectRepository.create({
    requestDate: moment(),
    referenceId: taskId,
    referenceType: 'TASK',
    note: remark,
    requestRole,
    requestBy,
    customer,
    projectId,
    companyId,
    referenceProjectId: projectId,
    referenceCompanyId: companyId,
    refs: { ...body },
  })
  await taskRepository.delete({ _id: taskId })
  return reject
}
