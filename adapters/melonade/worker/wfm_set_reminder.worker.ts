import { ITask, ITaskResponse } from '@melonade/melonade-client';
import { Types } from 'mongoose';
import { Inject } from 'typedi';
import { KafkaConfig, SystemConfig } from '../../../config';
import { IReminderRequest } from '../../../services/reminder/interface';
import { ReminderService } from '../../../services/reminder/reminder.service';
import { IQueueSccdStaffs } from '../../mongo/models/queueSccdStaffs.model';
import { QueueSccdStaffsRepository } from '../../mongo/repositories/queueSccdStaffs.mongo.repository';
import { MelonadeAbstraction } from '../melonade.abstraction';

type TaskProcessInput = {
  taskId: string;
  staffId: string;
  areaCode: string;
  durationTime: number;
  skills: string[];
  taskTypeGroup: string;
  deadline: string;
  priority: number;
  coordinates: number[];
};

export class WFM_SET_REMINDER extends MelonadeAbstraction {
  readonly taskName = 'wfm_set_reminder';
  constructor(
    @Inject('ReminderService')
    private reminderService: ReminderService,
    @Inject('QueueSccdStaffsRepository')
    private queueSccdStaffsRepository: QueueSccdStaffsRepository,
    @Inject('config.system')
    private systemConfig: SystemConfig,
    @Inject('config.kafka')
    private kafkaConfig: KafkaConfig,
  ) {
    super();
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input } = task;
    const {
      taskId,
      staffId,
      areaCode,
      skills,
      taskTypeGroup,
      durationTime,
      deadline,
      priority,
      coordinates,
    }: TaskProcessInput = input;

    const reprocessId = new Types.ObjectId();
    const createdAt = new Date();
    const expireAt = new Date();
    const expireTimeAsSec = Number(this.systemConfig.SCCD_EXPIRE_TIME);
    expireAt.setSeconds(expireAt.getSeconds() + expireTimeAsSec);

    const rescheduleData: IQueueSccdStaffs = {
      _id: reprocessId,
      task: taskId,
      staffs: [Types.ObjectId(staffId)],
      skills,
      taskTypeGroup,
      areaCode,
      durationTime,
      deadline: new Date(deadline),
      expireTimeAsSec,
      expireAt,
      priority,
      coordinates,
      createdAt,
      updatedAt: createdAt,
    };

    const requestCreateReminder: IReminderRequest = {
      when: expireAt.toISOString(),
      payload: rescheduleData,
      topic: this.kafkaConfig.KAFKA_TOPIC_4PL_WFM_SCCD || '4pl-wfm-sccd',
    };

    let reminder, rescheduling;
    try {
      reminder = await this.reminderService.createReminder(
        requestCreateReminder,
      );
    } catch (error) {
      return super.workerFailed({
        message: 'Failed to set reminder.',
        error,
      });
    }

    try {
      rescheduling = await this.queueSccdStaffsRepository.create(
        rescheduleData,
      );

      return super.workerCompleted({
        reminder,
        rescheduling,
      });
    } catch (error) {
      return super.workerFailed({
        message: 'Failed to save rescheduling data.',
        error,
      });
    }
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input } = task;
    const rescheduling = input.output.rescheduling;

    try {
      const deletedResult = await this.queueSccdStaffsRepository.softDeleteById(
        rescheduling._id,
      );
      return super.workerCompleted({ deletedResult });
    } catch (error) {
      return super.workerFailed({ error });
    }
  }
}
