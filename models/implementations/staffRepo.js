// @flow
import R from 'ramda'
import StaffRepository from '../staff.repository'
import { type IBaseRepository } from './type'
import logger from '../../libraries/logger'
import type { Staff } from '../../domains/staff/type'

export interface IStaffRepo {
  upsert(staff: Staff): Promise<any>;
}

export class StaffRepo implements IStaffRepo {
  repo: IBaseRepository

  constructor(repo: IBaseRepository) {
    this.repo = repo
  }

  async upsert(staff: Staff): Promise<any> {
    try {
      return this.repo.upsert({ _id: staff._id }, staff)
    } catch (error) {
      throw error
    }
  }
}

export const staffRepo = new StaffRepo(StaffRepository)
