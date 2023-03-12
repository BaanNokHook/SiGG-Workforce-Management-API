import { Types } from 'mongoose';
import { Service } from 'typedi';
import {
  IQueueSccdStaffs,
  queueSccdStaffsModel,
  queueSccdStaffsRepository,
} from '../models/queueSccdStaffs.model';

@Service('QueueSccdStaffsRepository')
export class QueueSccdStaffsRepository {
  async findByTaskIdForAcceptFindStaff(
    id: string,
  ): Promise<IQueueSccdStaffs | null> {
    const taskId = Types.ObjectId(id);
    const result = await queueSccdStaffsModel.findOne({
      task: taskId,
    });

    if (result) {
      return result?.toObject();
    }

    const resultTaskDeleted = await queueSccdStaffsRepository.model.findOneDeleted(
      {
        task: taskId,
      },
    );

    return resultTaskDeleted?.toObject();
  }

  async findById(id: string): Promise<IQueueSccdStaffs | null> {
    const ObjectId = Types.ObjectId(id);
    const result = await queueSccdStaffsModel.findOne({
      _id: ObjectId,
      deleted: false,
    });
    return result?.toObject();
  }

  async findByTaskId(id: string): Promise<IQueueSccdStaffs | null> {
    const taskId = Types.ObjectId(id);
    const result = await queueSccdStaffsModel.findOne({
      task: taskId,
      deleted: false,
    });
    return result?.toObject();
  }

  async create(request: IQueueSccdStaffs): Promise<IQueueSccdStaffs | null> {
    const result = await queueSccdStaffsModel.create(request);
    return result?.toObject();
  }

  async updateById(
    id: string,
    request: IQueueSccdStaffs,
  ): Promise<IQueueSccdStaffs | null> {
    const result = await queueSccdStaffsModel.updateOne(
      {
        _id: Types.ObjectId(id),
      },
      request,
    );
    return result;
  }

  async softDeleteById(id: string): Promise<any> {
    const result = await queueSccdStaffsModel.updateOne(
      {
        _id: Types.ObjectId(id),
      },
      {
        $set: {
          deletedAt: new Date(),
          deleted: true,
        },
      },
    );
    return result;
  }
}
