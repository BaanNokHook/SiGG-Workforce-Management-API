jest.mock('os');
import { ITask } from '@melonade/melonade-client';
import { mock, mockReset } from 'jest-mock-extended';
import mockDate from 'mockdate';
import { Types } from 'mongoose';
import { ReminderService } from '../../../services/reminder/reminder.service';
import { QueueSccdStaffsRepository } from '../../mongo/repositories/queueSccdStaffs.mongo.repository';
import { WFM_SET_REMINDER } from './wfm_set_reminder.worker';

const mockQueueSccdStaffsRepository = mock<QueueSccdStaffsRepository>();
const mockReminderService = mock<ReminderService>();
const mockSystemConfig = {
  COMPANY_ID: 'COMPANY_ID',
  PROJECT_ID: 'PROJECT_ID',
  SCCD_EXPIRE_TIME: 300,
};
const mockKafkaConfig = {
  MELONADE_KAFKA_BROKERS: 'MELONADE_KAFKA_BROKERS',
  MELONADE_NAMESPACE: 'MELONADE_NAMESPACE',
  KAFKA_URL: 'KAFKA_URL',
  KAFKA_TOPIC_4PL_WFM_SCCD: 'KAFKA_TOPIC_4PL_WFM_SCCD',
};

beforeEach(() => {
  mockReset(mockQueueSccdStaffsRepository);
  mockReset(mockReminderService);
  mockDate.reset();
});

afterAll(() => {
  mockDate.reset();
  jest.clearAllMocks();
});

const worker = new WFM_SET_REMINDER(
  mockReminderService,
  mockQueueSccdStaffsRepository,
  mockSystemConfig,
  mockKafkaConfig,
);

describe('WFM_SET_REMINDER', () => {
  describe('process', () => {
    it('should process failed when can not set reminder', async () => {
      const staff0 = new Types.ObjectId();
      let task: ITask = {} as any;
      task.input = {
        taskId: 'task_0',
        staffId: staff0,
        areaCode: '123456789',
        skills: ['skill_0'],
        taskTypeGroup: 'taskTypeGroup_0',
        durationTime: 180,
        deadline: '2021-02-12T10:00:00.000Z',
      };

      mockReminderService.createReminder.mockRejectedValueOnce({
        message: 'error',
      });
      const result = await worker.process(task);
      expect(result).toEqual({
        status: 'FAILED',
        output: {
          message: 'Failed to set reminder.',
          error: { message: 'error' },
        },
      });
    });

    it('should process failed when can not create rescheduling job', async () => {
      const staff0 = new Types.ObjectId();
      mockDate.set('2021-02-12T02:05:00.000Z');
      let task: ITask = {} as any;
      task.input = {
        taskId: 'task_0',
        staffId: staff0,
        areaCode: '123456789',
        skills: ['skill_0'],
        taskTypeGroup: 'taskTypeGroup_0',
        durationTime: 180,
        deadline: '2021-02-12T10:00:00.000Z',
      };

      mockReminderService.createReminder.mockResolvedValueOnce({
        data: {
          reminderId: 'c0j5rpq6ur8enc5jdpbg',
          status: 'PENDING',
          payload: {
            _id: 'id_0',
            task: 'task_0',
            staffs: [staff0],
            skills: ['skill_0'],
            taskTypeGroup: 'taskTypeGroup_0',
            areaCode: '123456789',
            durationTime: 180,
            deadline: '2021-02-12T10:00:00.000Z',
            expireTimeAsSec: 300,
            expireAt: '2021-02-12T02:10:00.000Z',
            priority: 2,
            coordinates: [103, 10],
            createdAt: '2021-02-12T02:05:00.000Z',
            updatedAt: '2021-02-12T02:05:00.000Z',
            deleted: false,
          },
          sink: {
            kafkaTopic: '4pl-wfm-sccd-local',
          },
          deadline: '2021-02-12T02:10:00.000Z',
          createdAt: '2021-02-12T02:05:00.000Z',
          completedAt: '0001-01-01T00:00:00Z',
        },
        errorMessage: '',
      });

      mockQueueSccdStaffsRepository.create.mockRejectedValueOnce({
        message: 'error',
      });

      const result = await worker.process(task);
      expect(result).toEqual({
        status: 'FAILED',
        output: {
          message: 'Failed to save rescheduling data.',
          error: { message: 'error' },
        },
      });
    });

    it('should process completed when do not have http error or database issues', async () => {
      const staff0 = new Types.ObjectId();
      mockDate.set('2021-02-12T02:05:00.000Z');
      let task: ITask = {} as any;
      task.input = {
        taskId: 'task_0',
        staffId: staff0,
        areaCode: '123456789',
        skills: ['skill_0'],
        taskTypeGroup: 'taskTypeGroup_0',
        durationTime: 180,
        deadline: '2021-02-12T10:00:00.000Z',
      };

      mockReminderService.createReminder.mockResolvedValueOnce({
        data: {
          reminderId: 'c0j5rpq6ur8enc5jdpbg',
          status: 'PENDING',
          payload: {
            _id: 'id_0',
            task: 'task_0',
            staffs: [staff0],
            skills: ['skill_0'],
            taskTypeGroup: 'taskTypeGroup_0',
            areaCode: '123456789',
            durationTime: 180,
            deadline: '2021-02-12T10:00:00.000Z',
            expireTimeAsSec: 300,
            expireAt: '2021-02-12T02:10:00.000Z',
            priority: 2,
            coordinates: [103, 10],
            createdAt: '2021-02-12T02:05:00.000Z',
            updatedAt: '2021-02-12T02:05:00.000Z',
            deleted: false,
          },
          sink: {
            kafkaTopic: '4pl-wfm-sccd-local',
          },
          deadline: '2021-02-12T02:10:00.000Z',
          createdAt: '2021-02-12T02:05:00.000Z',
          completedAt: '0001-01-01T00:00:00Z',
        },
        errorMessage: '',
      });

      mockQueueSccdStaffsRepository.create.mockResolvedValueOnce({
        _id: 'id_0',
        task: 'task_0',
        staffs: [staff0],
        skills: ['skill_0'],
        taskTypeGroup: 'taskTypeGroup_0',
        areaCode: '123456789',
        durationTime: 180,
        deadline: new Date('2021-02-12T10:00:00.000Z'),
        expireTimeAsSec: 300,
        expireAt: new Date('2021-02-12T02:10:00.000Z'),
        priority: 2,
        coordinates: [103, 10],
        createdAt: new Date('2021-02-12T02:05:00.000Z'),
        updatedAt: new Date('2021-02-12T02:05:00.000Z'),
        deleted: false,
      });

      const result = await worker.process(task);
      expect(result).toEqual({
        status: 'COMPLETED',
        output: {
          reminder: {
            data: {
              reminderId: 'c0j5rpq6ur8enc5jdpbg',
              status: 'PENDING',
              payload: {
                _id: 'id_0',
                task: 'task_0',
                staffs: [staff0],
                skills: ['skill_0'],
                taskTypeGroup: 'taskTypeGroup_0',
                areaCode: '123456789',
                durationTime: 180,
                deadline: '2021-02-12T10:00:00.000Z',
                expireTimeAsSec: 300,
                expireAt: '2021-02-12T02:10:00.000Z',
                priority: 2,
                coordinates: [103, 10],
                createdAt: '2021-02-12T02:05:00.000Z',
                updatedAt: '2021-02-12T02:05:00.000Z',
                deleted: false,
              },
              sink: {
                kafkaTopic: '4pl-wfm-sccd-local',
              },
              deadline: '2021-02-12T02:10:00.000Z',
              createdAt: '2021-02-12T02:05:00.000Z',
              completedAt: '0001-01-01T00:00:00Z',
            },
            errorMessage: '',
          },
          rescheduling: {
            _id: 'id_0',
            task: 'task_0',
            staffs: [staff0],
            skills: ['skill_0'],
            taskTypeGroup: 'taskTypeGroup_0',
            areaCode: '123456789',
            durationTime: 180,
            deadline: new Date('2021-02-12T10:00:00.000Z'),
            expireTimeAsSec: 300,
            expireAt: new Date('2021-02-12T02:10:00.000Z'),
            priority: 2,
            coordinates: [103, 10],
            createdAt: new Date('2021-02-12T02:05:00.000Z'),
            updatedAt: new Date('2021-02-12T02:05:00.000Z'),
            deleted: false,
          },
        },
      });
    });
  });

  describe('compensate', () => {
    it('should compensate failed when can not set deleted flag to created rescheduling job', async () => {
      const staff0 = new Types.ObjectId();
      mockDate.set('2021-02-12T02:05:00.000Z');
      let task: ITask = {} as any;
      task.input = {
        output: {
          reminder: {
            data: {
              reminderId: 'c0j5rpq6ur8enc5jdpbg',
              status: 'PENDING',
              payload: {
                _id: 'id_0',
                task: 'task_0',
                staffs: [staff0],
                skills: ['skill_0'],
                taskTypeGroup: 'taskTypeGroup_0',
                areaCode: '123456789',
                durationTime: 180,
                deadline: '2021-02-12T10:00:00.000Z',
                expireTimeAsSec: 300,
                expireAt: '2021-02-12T02:10:00.000Z',
                priority: 2,
                coordinates: [103, 10],
                createdAt: '2021-02-12T02:05:00.000Z',
                updatedAt: '2021-02-12T02:05:00.000Z',
                deleted: false,
              },
              sink: {
                kafkaTopic: '4pl-wfm-sccd-local',
              },
              deadline: '2021-02-12T02:10:00.000Z',
              createdAt: '2021-02-12T02:05:00.000Z',
              completedAt: '0001-01-01T00:00:00Z',
            },
            errorMessage: '',
          },
          rescheduling: {
            _id: 'id_0',
            task: 'task_0',
            staffs: [staff0],
            skills: ['skill_0'],
            taskTypeGroup: 'taskTypeGroup_0',
            areaCode: '123456789',
            durationTime: 180,
            deadline: new Date('2021-02-12T10:00:00.000Z'),
            expireTimeAsSec: 300,
            expireAt: new Date('2021-02-12T02:10:00.000Z'),
            priority: 2,
            coordinates: [103, 10],
            createdAt: new Date('2021-02-12T02:05:00.000Z'),
            updatedAt: new Date('2021-02-12T02:05:00.000Z'),
            deleted: false,
          },
        },
      };

      mockQueueSccdStaffsRepository.softDeleteById.mockRejectedValueOnce({
        message: 'error',
      });

      const result = await worker.compensate(task);
      expect(result).toEqual({
        status: 'FAILED',
        output: {
          error: { message: 'error' },
        },
      });
    });

    it('should compensate completed when do not have http error', async () => {
      const staff0 = new Types.ObjectId();
      mockDate.set('2021-02-12T02:05:00.000Z');
      let task: ITask = {} as any;
      task.input = {
        output: {
          reminder: {
            data: {
              reminderId: 'c0j5rpq6ur8enc5jdpbg',
              status: 'PENDING',
              payload: {
                _id: 'id_0',
                task: 'task_0',
                staffs: [staff0],
                skills: ['skill_0'],
                taskTypeGroup: 'taskTypeGroup_0',
                areaCode: '123456789',
                durationTime: 180,
                deadline: '2021-02-12T10:00:00.000Z',
                expireTimeAsSec: 300,
                expireAt: '2021-02-12T02:10:00.000Z',
                priority: 2,
                coordinates: [103, 10],
                createdAt: '2021-02-12T02:05:00.000Z',
                updatedAt: '2021-02-12T02:05:00.000Z',
                deleted: false,
              },
              sink: {
                kafkaTopic: '4pl-wfm-sccd-local',
              },
              deadline: '2021-02-12T02:10:00.000Z',
              createdAt: '2021-02-12T02:05:00.000Z',
              completedAt: '0001-01-01T00:00:00Z',
            },
            errorMessage: '',
          },
          rescheduling: {
            _id: 'id_0',
            task: 'task_0',
            staffs: [staff0],
            skills: ['skill_0'],
            taskTypeGroup: 'taskTypeGroup_0',
            areaCode: '123456789',
            durationTime: 180,
            deadline: new Date('2021-02-12T10:00:00.000Z'),
            expireTimeAsSec: 300,
            expireAt: new Date('2021-02-12T02:10:00.000Z'),
            priority: 2,
            coordinates: [103, 10],
            createdAt: new Date('2021-02-12T02:05:00.000Z'),
            updatedAt: new Date('2021-02-12T02:05:00.000Z'),
            deleted: false,
          },
        },
      };

      mockQueueSccdStaffsRepository.softDeleteById.mockResolvedValueOnce({
        updated: 1,
      });

      const result = await worker.compensate(task);
      expect(result).toEqual({
        status: 'COMPLETED',
        output: {
          deletedResult: { updated: 1 },
        },
      });
    });
  });
});
