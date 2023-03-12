import mongoose from 'mongoose'
import moment from 'moment'
import TaskRepository from '../../models/task.repository'

type Options = {
  populate?: string,
  time?: string,
  sort?: { [key: string]: 1 | -1 },
}
export default async (filter: any, options: Options) => {
  // const date = new Date(options.time)
  const date = moment(options.time).toDate()
  const startDate = moment(options.time)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate()
  const response = await TaskRepository.aggregate([
    { $match: { staffs: { $in: JSON.parse(filter).map(mongoose.Types.ObjectId) } } },
    { $match: { windowTime: { $gt: startDate } } },
    { $match: { windowTime: { $lt: date } } },
    { $unwind: '$staffs' },
    { $sort: { windowTime: -1 } },
    {
      $group: {
        _id: '$staffs',
        windowTime: { $first: '$windowTime' },
        geographyId: { $first: '$geographyId' },
      },
    },

    {
      $lookup: {
        from: 'geographies',
        localField: 'geographyId',
        foreignField: '_id',
        as: 'geography',
      },
    },
  ])
  return response
}
