import TaskRepository from '../../models/task.repository'

export async function filterAvailableStaffsByPriority(staffIds, priority, windowTime, projectId) {
  const tasks = await TaskRepository.find({
    staffs: { $in: staffIds },
    priority: { $gte: priority },
    projectId,
    $or: [
      {
        'windowTime.0': { $eq: new Date(windowTime[0]) },
        'windowTime.1': { $eq: new Date(windowTime[1]) },
      },
      {
        'windowTime.0': { $lt: new Date(windowTime[0]) },
        'windowTime.1': { $gt: new Date(windowTime[0]) },
      },
      {
        'windowTime.0': { $lt: new Date(windowTime[1]) },
        'windowTime.1': { $gt: new Date(windowTime[1]) },
      },
    ],
  })

  const staffsNotAvailable = tasks.data
    .map((task) => task.staffs)
    .reduce((staff, arr) => staff.concat(arr), [])
    .map((transformStaffId) => String(transformStaffId))

  const filteredAvailableStaffs = staffIds.filter(
    (staffId) => staffsNotAvailable.indexOf(staffId) === -1,
  )

  return { staffIds: filteredAvailableStaffs }
}
