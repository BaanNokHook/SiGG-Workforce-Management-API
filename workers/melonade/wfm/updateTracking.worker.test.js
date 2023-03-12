import { TaskStates } from '@melonade/melonade-client'

import MockDate from 'mockdate'
import UpdateTrackingWorker from './updateTracking.worker'
import tracking from '../../../domains/task/updateTracking'
import { fleetApiService } from '../../../adapters/restClient/fleet'
import { taskRepo } from '../../../models/implementations/taskRepo'

jest.mock('../../../adapters/restClient/fleet')

describe('wfm_update_tracking', () => {
  MockDate.set('2021-04-19')
  const updateTrackingWorker = new UpdateTrackingWorker()
  const melonadeTask = {
    input: {
      taskIds: ['some_task_id'],
      type: 'TaskAssigned',
      assignedTo: {
        id: '5fc89734f2fb9a12dba308e3',
        firstname: 'นายณรงค์กร',
        lastname: 'ศรีบุญเรือง',
        phone: '0638073679',
      },
      creator: {
        id: '5fc89734f2fb9a12dba308e3',
        firstname: 'นายณรงค์กร',
        lastname: 'ศรีบุญเรือง',
        phone: '0638073679',
      },
      metadata: {
        source: 'HUMAN',
      },
      staffId: '5fc89734f2fb9a12dba308e3',
    },
  }

  test('Worker should error when taskIds is empty', async () => {
    const result = await updateTrackingWorker.process({
      input: {},
    })
    expect(result.status).toEqual(TaskStates.Failed)
    expect(result.output.error).toEqual(new Error('input is invalid: taskIds is Empty'))
  })

  test('worker should update successfully', async () => {
    const updatedTracking = {
      _id: 'some_task_id',
      type: 'TaskAssigned',
      data: {
        assignedTo: {
          id: '5fc89734f2fb9a12dba308e3',
          firstname: 'นายณรงค์กร',
          lastname: 'ศรีบุญเรือง',
          phone: '0638073679',
        },
      },
      creator: {
        id: '5fc89734f2fb9a12dba308e3',
        firstname: 'นายณรงค์กร',
        lastname: 'ศรีบุญเรือง',
        phone: '0638073679',
      },
      metadata: {
        source: 'HUMAN',
      },
      createdAt: new Date('2021-04-19'),
    }

    jest.spyOn(taskRepo, 'getTaskById').mockResolvedValueOnce({ staffs: ['sidd'] })
    fleetApiService.getStaff.mockResolvedValueOnce({ data: {} })
    tracking.push = jest.fn().mockResolvedValueOnce(updatedTracking)

    const result = await updateTrackingWorker.process(melonadeTask)

    expect(result).toEqual({
      status: TaskStates.Completed,
      message: 'tracking updated successfully',
      output: [updatedTracking],
    })
  })

  test('Worker should compensate successfully when there is no error', async () => {
    tracking.pop = jest.fn().mockResolvedValueOnce([])

    const result = await updateTrackingWorker.compensate(melonadeTask)

    expect(result).toEqual({
      status: TaskStates.Completed,
      message: 'tracking compensated successfully',
    })
  })

  test('Worker should fail to compensate when there is error', async () => {
    tracking.pop = jest.fn().mockRejectedValueOnce(new Error())

    const result = await updateTrackingWorker.compensate(melonadeTask)

    expect(result).toEqual({
      status: TaskStates.Failed,
      message: 'tracking compensated unsuccessfully',
    })
  })
})
