import * as R from 'ramda'
import logger from '../../libraries/logger'
import { taskRepo } from '../../models/implementations/taskRepo'
import authHttpService from '../../services/httpService/auth'
import ThrowError from '../../error/basic'
import getStaff from '../staff/view'

export class TaskStaffsDomain {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async getStaffs(taskId: string) {
    const task = await this.taskRepository.getTaskById(taskId)
    const staffPromises = task.staffs.map((staffId) => this.findStaff(staffId))
    const staffs = await Promise.all(staffPromises)

    const userPromises = staffs.map(async (staff) => {
      const user = await this.findUserFromAuth(staff.userId)
      return {
        ...staff,
        user,
      }
    })

    const res = await Promise.all(userPromises)
    return res
  }

  async findStaff(staffId) {
    try {
      const staff = await getStaff({ _id: staffId })
      logger.info({ event: 'GET_STAFF', staffId })
      return staff.toObject()
    } catch (error) {
      logger.error({ event: 'GET_STAFF', staffId, err: error })
      throw ThrowError.NOT_FOUND(`Staff id ${staffId} not found`)
    }
  }

  async findUserFromAuth(userId) {
    try {
      const userResp = await authHttpService.get({
        thing: 'v1/users/find',
        findBy: userId,
        options: { select: ['_id'] },
      })
      logger.info({ event: 'FIND_USER', userId })
      return R.pathOr('', ['data', 'data'], userResp)
    } catch (error) {
      logger.error({ event: 'FIND_USER', userId, err: error })
      throw ThrowError.NOT_FOUND(`User id ${userId} not found`)
    }
  }
}

export const taskStaffDomain = new TaskStaffsDomain(taskRepo)
