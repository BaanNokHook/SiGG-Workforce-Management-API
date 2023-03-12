import { TaskStates } from '@melonade/melonade-client'
import { Types } from 'mongoose'
import taskRepository from '../../models/task.repository'
import AssignStaffToTasks, { ITaskInput } from './assign_staff_to_tasks.worker'

describe('Assign staff to tasks', () => {
  const AssignStaffToTasksWorker = new AssignStaffToTasks()

  const task1 = {
    staffs: ['5fc89734f2fb9a12dba30805'],
    status: 'NEW',
    windowTime: ['2021-05-12T08:00:00.000Z', '2021-05-12T09:00:00.000Z'],
    _id: '609a122b452c4b0011eaccbd',
    orderId: '391d6260-b210-11eb-ba01-7386d98e3e08-1',
    information: {
      queue: 'A',
      metaInformation: {
        orderBaseInformation: {
          planFinishTime: '2021-05-12 09:00',
          planStartTime: '2021-05-12 08:00',
          travelingTime: '60',
          appointmentTime: '2021-05-12 08:00:00',
        },
      },
    },
  }
  const task2 = {
    staffs: ['5fc89734f2bb9a12dba30811'],
    status: 'NEW',
    windowTime: ['2021-05-11T13:04:29.733Z'],
    _id: '609a80ddf60ad3001173f292',
    orderId: '67ef46a0-b259-11eb-ba01-7386d98e3e08-1',
    information: {
      queue: 'A',
      metaInformation: {
        orderBaseInformation: {
          planFinishTime: '2021-05-12 10:00:00',
          planStartTime: '2021-05-12 09:00:00',
          travelingTime: '60',
          appointmentTime: '2021-05-12 09:00:00',
        },
      },
    },
  }

  const routeForTask1 = {
    id: '609a122b452c4b0011eaccbd',
    lat: 15.105631,
    lng: 99.853953,
    timeWindowStart: 1400,
    timeWindowEnd: 1500,
    planStartTime: '14:00',
    planFinishTime: '15:00',
    travelingTime: 60,
    serviceTime: 60,
  }

  const routeForTask2 = {
    id: '609a80ddf60ad3001173f292',
    lat: 14.997734,
    lng: 100.00949,
    timeWindowStart: 1500,
    timeWindowEnd: 1600,
    planStartTime: '15:00',
    planFinishTime: '16:00',
    travelingTime: 60,
    serviceTime: 60,
  }

  describe('Process', () => {
    test('update staff and detail in task success', async () => {
      const staffId = Types.ObjectId('60a244773089370011ec6556')
      const taskInput: ITaskInput = {
        staffId: '60a244773089370011ec6556',
        tasks: [task1, task2],
        route: [routeForTask1, routeForTask2],
      }

      const task = {
        input: taskInput,
      }

      const expectBulkWriteCommand = [
        {
          updateOne: {
            filter: {
              _id: Types.ObjectId('609a122b452c4b0011eaccbd'),
            },
            update: {
              $set: {
                'information.metaInformation.orderBaseInformation.travelingTime': 60,
                staffs: [staffId],
                tripId: null,
              },
            },
          },
        },
        {
          updateOne: {
            filter: {
              _id: Types.ObjectId('609a80ddf60ad3001173f292'),
            },
            update: {
              $set: {
                'information.metaInformation.orderBaseInformation.travelingTime': 60,
                staffs: [staffId],
                tripId: null,
              },
            },
          },
        },
      ]

      taskRepository.model.bulkWrite = jest.fn().mockResolvedValueOnce({})

      const { status, output } = await AssignStaffToTasksWorker.process(task)

      expect(taskRepository.model.bulkWrite).toHaveBeenCalledWith(expectBulkWriteCommand)
      expect(status).toEqual(TaskStates.Completed)
      expect(output).toEqual({
        taskIds: ['609a122b452c4b0011eaccbd', '609a80ddf60ad3001173f292'],
        tasks: [
          {
            _id: '609a122b452c4b0011eaccbd',
            tripId: null,
            information: {
              metaInformation: {
                orderBaseInformation: {
                  appointmentTime: '2021-05-12 08:00:00',
                  planFinishTime: '2021-05-12 09:00',
                  planStartTime: '2021-05-12 08:00',
                  travelingTime: 60,
                },
              },
              queue: 'A',
            },
            orderId: '391d6260-b210-11eb-ba01-7386d98e3e08-1',
            staffs: ['60a244773089370011ec6556'],
            status: 'NEW',
            windowTime: ['2021-05-12T08:00:00.000Z', '2021-05-12T09:00:00.000Z'],
          },
          {
            _id: '609a80ddf60ad3001173f292',
            tripId: null,
            information: {
              metaInformation: {
                orderBaseInformation: {
                  appointmentTime: '2021-05-12 09:00:00',
                  planFinishTime: '2021-05-12 10:00:00',
                  planStartTime: '2021-05-12 09:00:00',
                  travelingTime: 60,
                },
              },
              queue: 'A',
            },
            orderId: '67ef46a0-b259-11eb-ba01-7386d98e3e08-1',
            staffs: ['60a244773089370011ec6556'],
            status: 'NEW',
            windowTime: ['2021-05-11T13:04:29.733Z'],
          },
        ],
      })
    })
  })
})
