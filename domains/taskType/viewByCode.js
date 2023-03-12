// @flow
import type { TaskType } from '../../models/taskType.repository'
import TaskTypeRepository from '../../models/taskType.repository'
import { checkFindOne, isRequiredField } from '../../utils/domain'

const validate = {
  code: true,
}

export default async (code: string, options: any): Promise<TaskType> => {
  const filter = { code }
  isRequiredField(filter, validate)
  const response = await checkFindOne(TaskTypeRepository, filter, options)
  return response
}
