/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import logger from '../../libraries/logger'
import type { TaskType } from '../../models/taskType.repository'
import TaskTypeRepository from '../../models/taskType.repository'
import { validateData } from '../../utils/validate'

function validateInput(taskType: TaskType) {
  validateData({
    schema: {
      properties: {
        code: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        skills: {
          type: 'array',
        },
        taskTypeGroup: {
          type: 'string',
        },
        projectId: {
          type: 'string',
        },
        companyId: {
          type: 'string',
        },
        mapping: {
          type: 'array',
        },
        durationTime: {
          type: 'number',
        },
        todoFlowId: {
          type: 'string',
        },
      },
      required: [
        'code',
        'name',
        'skills',
        'taskTypeGroup',
        'projectId',
        'companyId',
        'mapping',
        'durationTime',
        'todoFlowId',
      ],
    },
    data: taskType,
  })
}

export default async (taskTypes = []) => {
  const statuses = []
  for (const taskType of taskTypes) {
    const { code, companyId, projectId } = taskType
    try {
      validateInput(taskType)
      const { _id } = await TaskTypeRepository.upsert({ code, projectId, companyId }, taskType)
      statuses.push({
        taskTypeId: _id,
        taskTypeCode: code,
        companyId,
        projectId,
        status: `Imported`,
        error: false,
      })
    } catch (error) {
      statuses.push({
        taskTypeCode: code,
        companyId,
        projectId,
        status: `Failed: ${error.message}`,
        error: true,
      })
    }
  }

  logger.info({ event: 'import_task_type_mapping' }, JSON.stringify(statuses))

  return statuses
}
