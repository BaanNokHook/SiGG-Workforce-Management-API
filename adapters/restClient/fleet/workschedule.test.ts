import {
  getTimeSlotsWithoutTimeCollisionWorkSchedules,
  isStartTimeAndEndTimeAreEqual,
  IWorkSchedule,
} from './workschedule';

describe('isStartTimeAndEndTimeAreEqual', () => {
  // data from timeslot
  const srcStartTime = '10:00';
  const srcEndTime = '11:00';

  test('getTimeSlotsWithoutTimeCollisionWorkSchedules', () => {
    const timeSlots = [
      {
        isActive: true,
        _id: '5d8a00191f21e7f72eaefd15',
        from: '09:00',
        to: '10:00',
        slug: '09:00-10:00',
      },
      {
        isActive: true,
        _id: '5d8a005d1f21e7f72eaf10e9',
        from: '10:00',
        to: '11:00',
        slug: '10:00-11:00',
      },
      {
        isActive: true,
        _id: '5d8a008b1f21e7f72eaf1b22',
        from: '11:00',
        to: '12:00',
        slug: '11:00-12:00',
      },
      {
        isActive: true,
        _id: '5d8a009c1f21e7f72eaf2487',
        from: '13:00',
        to: '14:00',
        slug: '13:00-14:00',
      },
      {
        isActive: true,
        _id: '5d8a00ad1f21e7f72eaf25e5',
        from: '14:00',
        to: '15:00',
        slug: '14:00-15:00',
      },
      {
        isActive: true,
        _id: '5d8a00bd1f21e7f72eaf294c',
        from: '15:00',
        to: '16:00',
        slug: '15:00-16:00',
      },
      {
        isActive: true,
        _id: '5d8a00e51f21e7f72eaf36f9',
        from: '16:00',
        to: '17:00',
        slug: '16:00-17:00',
      },
      {
        isActive: true,
        _id: '5d8a00f41f21e7f72eaf37d8',
        from: '17:00',
        to: '18:00',
        slug: '17:00-18:00',
      },
    ];
    const workSchedules: IWorkSchedule[] = [
      {
        actualTime: [
          new Date('2021-02-11T01:04:07.201Z'),
          new Date('2021-02-11T02:31:56.247Z'),
        ],
        status: 'DONE',
        windowTime: ['2021-02-11T02:00:00.000Z', '2021-02-11T05:00:00.000Z'],
        taskIds: ['6020a87c0850090013bf29d6'],
        metadata: {
          arrivedAt: '2021-02-11T02:01:24.259Z',
        },
        deleted: false,
        _id: '6020a87cd4b5f20025b370ff',
        companyId: '5cee7a9bfc47036f05b13847',
        projectId: '5cf0ad79b603c7605955bc7f',
        staffId: '5fd704a119db2845152e4207',
        userId: '5fd704a119db2845152e4206',
        tripId: '6020a87c4a14b60013f26a0c',
        orderId: '4ffda020-69b9-11eb-a609-e5309cfa208c-1',
        createdAt: new Date('2021-02-08T02:57:00.689Z'),
        updatedAt: new Date('2021-02-11T04:55:25.952Z'),
      },
      {
        actualTime: [
          new Date('2021-02-11T04:11:07.903Z'),
          new Date('2021-02-11T04:55:25.892Z'),
        ],
        status: 'TODO',
        windowTime: ['2021-02-11T08:00:00.000Z', '2021-02-11T11:00:00.000Z'],
        taskIds: ['6020a9090d970200121c3bcb'],
        metadata: {
          arrivedAt: '2021-02-11T04:11:13.034Z',
        },
        deleted: false,
        _id: '6020a90ad4b5f20025b37101',
        companyId: '5cee7a9bfc47036f05b13847',
        projectId: '5cf0ad79b603c7605955bc7f',
        staffId: '5fd704a119db2845152e4207',
        userId: '5fd704a119db2845152e4206',
        tripId: '6020a87c4a14b60013f26a0c',
        orderId: 'a47a5940-69b9-11eb-9071-53aaf92b8dcd-1',
        createdAt: new Date('2021-02-08T02:59:22.381Z'),
        updatedAt: new Date('2021-02-11T04:55:25.951Z'),
      },
    ];
    const result = getTimeSlotsWithoutTimeCollisionWorkSchedules(
      timeSlots,
      workSchedules,
    );

    expect(result).toEqual([
      {
        _id: '5d8a009c1f21e7f72eaf2487',
        from: '13:00',
        isActive: true,
        slug: '13:00-14:00',
        to: '14:00',
      },
      {
        _id: '5d8a00ad1f21e7f72eaf25e5',
        from: '14:00',
        isActive: true,
        slug: '14:00-15:00',
        to: '15:00',
      },
    ]);
  });

  test('equal case in same day', () => {
    const dstStartTime = new Date('2020-12-29T03:00:00.000Z').toUTCString();
    const dstEndTime = new Date('2020-12-29T04:00:00.000Z').toUTCString();

    const isTimesAreEqual = isStartTimeAndEndTimeAreEqual(
      srcStartTime.toString(),
      srcEndTime.toString(),
      dstStartTime,
      dstEndTime,
    );

    expect(isTimesAreEqual).toBeTruthy();
  });

  test('equal case in other day', () => {
    const dstStartTime = new Date('2020-12-30T03:00:00.000Z').toUTCString();
    const dstEndTime = new Date('2020-12-31T04:00:00.000Z').toUTCString();

    const isTimesAreEqual = isStartTimeAndEndTimeAreEqual(
      srcStartTime.toString(),
      srcEndTime.toString(),
      dstStartTime,
      dstEndTime,
    );

    expect(isTimesAreEqual).toBeTruthy();
  });

  test('not equal case in same day', () => {
    const dstStartTime = new Date('2020-12-29T12:00:00.000Z').toUTCString();
    const dstEndTime = new Date('2020-12-29T13:00:00.000Z').toUTCString();

    const isTimesAreEqual = isStartTimeAndEndTimeAreEqual(
      srcStartTime.toString(),
      srcEndTime.toString(),
      dstStartTime,
      dstEndTime,
    );

    expect(isTimesAreEqual).toBeFalsy();
  });
});
