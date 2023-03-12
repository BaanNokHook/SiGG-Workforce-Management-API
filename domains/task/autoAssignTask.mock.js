const defaultDistanceMatrixResp = [
  [0, 125.7, 130.5, 84.4, 194.2, 174.3, 340.6, 280.9, 174.3],
  [57, 0, 187.5, 85.9, 251.2, 231.3, 397.6, 337.9, 231.3],
  [192.8, 188.6, 0, 229.2, 387, 367.1, 533.4, 314.9, 367.1],
  [93.7, 80.4, 175.7, 0, 263.9, 244, 344.9, 350.6, 244],
  [236.4, 284.1, 288.9, 265.3, 0, 283, 521.5, 389.6, 283],
  [228.3, 276, 280.8, 257.2, 299.9, 0, 513.4, 147.3, 0],
  [308.3, 378.4, 390.3, 298, 478.5, 458.6, 0, 565.2, 458.6],
  [323.8, 371.5, 319.9, 352.7, 395.4, 165.3, 608.9, 0, 165.3],
  [228.3, 276, 280.8, 257.2, 299.9, 0, 513.4, 147.3, 0],
]

const defaultInput = [
  {
    staffId: 'staff1',
    userId: 'userId',
    username: 'username',
    dateTime: '2020-08-31T03:00:50.000Z',
    shiftSlots: [
      {
        start: '2020-08-31T02:00:00.000Z',
        end: '2020-08-31T05:00:00.000Z',
      },
      {
        start: '2020-08-31T06:00:00.000Z',
        end: '2020-08-31T13:00:00.000Z',
      },
    ],
    skills: [
      {
        id: 's1',
        level: 1,
      },
      {
        id: 's2',
        level: 1,
      },
      {
        id: 's3',
        level: 1,
      },
      {
        id: 's4',
        level: 1,
      },
      {
        id: 's5',
        level: 1,
      },
      {
        id: 's6',
        level: 1,
      },
      {
        id: 's7',
        level: 1,
      },
      {
        id: 's8',
        level: 1,
      },
    ],
    areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
    currentLocation: {
      latitude: 13.6833356,
      longitude: 100.6114868,
    },
    defaultLocation: {
      latitude: 13.6792704,
      longitude: 100.6095851,
    },
  },
]

const defaultTrip = {
  _id: 'tripId',
  tasks: [
    {
      windowTime: ['2020-08-31T02:42:00.000Z', '2020-08-31T03:30:00.000Z'],
      information: {
        metaInformation: {
          baseInformation: {
            standardTimeLength: 30,
          },
          orderBaseInformation: {
            location: {
              latitude: '13.6837056',
              longitude: '100.6051198',
            },
          },
        },
      },
      status: 'TODO',
    },
    {
      status: 'TODO',
      windowTime: ['2020-08-31T07:00:00.000Z', '2020-08-31T07:30:00.000Z'],
      information: {
        metaInformation: {
          baseInformation: {
            standardTimeLength: 30,
          },
          orderBaseInformation: {
            location: {
              latitude: '13.6810438',
              longitude: '100.6122772',
            },
          },
        },
      },
    },
    {
      status: 'TODO',
      windowTime: ['2020-08-31T09:00:00.000Z', '2020-08-31T09:30:00.000Z'],
      information: {
        metaInformation: {
          baseInformation: {
            standardTimeLength: 30,
          },
          orderBaseInformation: {
            location: {
              latitude: '13.6650324',
              longitude: '100.6110479',
            },
          },
        },
      },
    },
  ],
  windowTime: ['2020-08-31T02:42:00.000Z', '2020-08-31T09:30:00.000Z'],
}

export const mockDataQR = {
  input: defaultInput,
  tripResp: defaultTrip,
  taskPoolsResp: [
    // QA task doesn't match available slot
    {
      _id: 't1',
      status: 'NEW',
      windowTime: ['2020-08-31T02:00:00.000Z', '2020-08-31T03:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6749936',
              longitude: '100.5916773',
            },
          },
        },
      },
    },
    {
      _id: 't2',
      status: 'FAILED',
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'R',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6766742',
              longitude: '100.645278',
            },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataQA = {
  input: defaultInput,
  tripResp: defaultTrip,
  taskPoolsResp: [
    {
      _id: 't1',
      status: 'FAILED',
      windowTime: ['2020-08-31T02:00:00.000Z', '2020-08-31T03:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6749936',
              longitude: '100.5916773',
            },
          },
        },
      },
    },
    {
      _id: 't2',
      status: 'FAILED',
      windowTime: ['2020-08-31T01:00:00.000Z', '2020-08-31T02:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6766742',
              longitude: '100.645278',
            },
          },
        },
      },
    },
    {
      _id: 't3',
      status: 'FAILED',
      windowTime: ['2020-08-31T11:00:00.000Z', '2020-08-31T12:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 12:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6882703',
              longitude: '100.5911328',
            },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataTomorrowTask = {
  input: defaultInput,
  tripResp: defaultTrip,
  taskPoolsResp: [
    {
      _id: 't1',
      status: 'FAILED',
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'R',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-09-01 01:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6749936',
              longitude: '100.5916773',
            },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataQANotBehindCurrentTime = {
  input: [
    {
      staffId: 'staff1',
      userId: 'userId',
      username: 'username',
      dateTime: '2020-12-15T10:31:33.121Z',
      shiftSlots: [
        {
          start: '2020-12-15T02:00:33.121Z',
          end: '2020-12-15T15:00:33.121Z',
        },
      ],
      skills: [
        {
          id: 's1',
          level: 1,
        },
        {
          id: 's2',
          level: 1,
        },
        {
          id: 's3',
          level: 1,
        },
        {
          id: 's4',
          level: 1,
        },
        {
          id: 's5',
          level: 1,
        },
        {
          id: 's6',
          level: 1,
        },
        {
          id: 's7',
          level: 1,
        },
        {
          id: 's8',
          level: 1,
        },
      ],
      areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
      currentLocation: {
        latitude: 13.6833356,
        longitude: 100.6114868,
      },
      defaultLocation: {
        latitude: 13.6792704,
        longitude: 100.6095851,
      },
    },
  ],
  tripResp: {
    _id: 'tripId',
    tasks: [],
    windowTime: [],
  },
  taskPoolsResp: [
    {
      _id: 't3',
      status: 'FAILED',
      windowTime: ['2020-12-15T02:00:00.000Z', '2020-12-15T03:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-12-16 03:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6882703',
              longitude: '100.5911328',
            },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataAssignedAt07AMForTask06 = {
  input: [
    {
      staffId: 'staff1',
      userId: 'userId',
      username: 'username',
      dateTime: '2020-12-14T17:00:00.000Z',
      shiftSlots: [
        {
          start: '2000-01-01T20:00:00.000Z',
          end: '2000-01-01T23:00:00.000Z',
        },
        {
          start: '2000-01-01T00:00:00.000Z',
          end: '2000-01-01T01:00:00.000Z',
        },
        {
          start: '2000-01-01T02:00:00.000Z',
          end: '2000-01-01T05:00:00.000Z',
        },
        {
          start: '2000-01-01T06:00:00.000Z',
          end: '2000-01-01T11:00:00.000Z',
        },
      ],
      skills: [],
      areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
      currentLocation: { latitude: 0, longitude: 0 },
      defaultLocation: { latitude: 0, longitude: 0 },
    },
  ],
  tripResp: {
    _id: 'tripId',
    tasks: [],
    windowTime: [],
  },
  taskPoolsResp: [
    {
      _id: 't3',
      status: 'FAILED',
      windowTime: ['2020-12-14T22:00:00.000Z', '2020-12-14T23:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-12-15 23:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: { latitude: 0, longitude: 0 },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataAssignedAt07AMForTask723 = {
  input: [
    {
      staffId: 'staff1',
      userId: 'userId',
      username: 'username',
      dateTime: '2020-12-14T17:00:00.000Z',
      shiftSlots: [
        {
          start: '2000-01-01T00:00:00.000Z',
          end: '2000-01-01T01:00:00.000Z',
        },
        {
          start: '2000-01-01T02:00:00.000Z',
          end: '2000-01-01T05:00:00.000Z',
        },
        {
          start: '2000-01-01T06:00:00.000Z',
          end: '2000-01-01T11:00:00.000Z',
        },
      ],
      skills: [],
      areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
      currentLocation: { latitude: 0, longitude: 0 },
      defaultLocation: { latitude: 0, longitude: 0 },
    },
  ],
  tripResp: {
    _id: 'tripId',
    tasks: [],
    windowTime: [],
  },
  taskPoolsResp: [
    {
      _id: 't3',
      status: 'FAILED',
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'R',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-12-15 01:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: { latitude: 0, longitude: 0 },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataMustNotAssignAtMidnight = {
  input: [
    {
      staffId: 'staff1',
      userId: 'userId',
      username: 'username',
      dateTime: '2020-12-15T16:00:00.000Z',
      shiftSlots: [
        {
          start: '2020-09-15T01:00:00.000Z',
          end: '2020-09-15T16:45:00.000Z',
        },
      ],
      skills: [],
      areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
      currentLocation: { latitude: 0, longitude: 0 },
      defaultLocation: { latitude: 0, longitude: 0 },
    },
  ],
  tripResp: {
    _id: 'tripId',
    tasks: [],
    windowTime: [],
  },
  taskPoolsResp: [
    {
      _id: 't3',
      status: 'FAILED',
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'R',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-12-16 01:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: { latitude: 0, longitude: 0 },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}

export const mockDataQAWarranty = {
  input: [
    {
      staffId: 'staff1',
      userId: 'userId',
      username: 'username',
      dateTime: '2020-08-31T03:00:50.000Z',
      reserveTimes: [
        // exactly match slot
        {
          start: '2020-08-31T02:00:00.000Z',
          end: '2020-08-31T02:42:00.000Z',
        },
        // left match slot
        {
          start: '2020-08-31T03:30:00.000Z',
          end: '2020-08-31T04:00:00.000Z',
        },
        // right match slot
        {
          start: '2020-08-31T08:00:00.000Z',
          end: '2020-08-31T09:00:00.000Z',
        },
        // middle split slot
        {
          start: '2020-08-31T11:00:00.000Z',
          end: '2020-08-31T12:00:00.000Z',
        },
      ],
      shiftSlots: [
        {
          start: '2020-08-31T02:00:00.000Z',
          end: '2020-08-31T05:00:00.000Z',
        },
        {
          start: '2020-08-31T06:00:00.000Z',
          end: '2020-08-31T13:00:00.000Z',
        },
      ],
      skills: [
        {
          id: 's1',
          level: 1,
        },
        {
          id: 's2',
          level: 1,
        },
        {
          id: 's3',
          level: 1,
        },
        {
          id: 's4',
          level: 1,
        },
        {
          id: 's5',
          level: 1,
        },
        {
          id: 's6',
          level: 1,
        },
        {
          id: 's7',
          level: 1,
        },
        {
          id: 's8',
          level: 1,
        },
      ],
      areaCodes: ['103202010000', '103202020000', '103202030000', '103202040000', '103202040100'],
      currentLocation: {
        latitude: 13.6833356,
        longitude: 100.6114868,
      },
      defaultLocation: {
        latitude: 13.6792704,
        longitude: 100.6095851,
      },
    },
  ],
  tripResp: defaultTrip,
  taskPoolsResp: [
    {
      _id: 't1',
      status: 'FAILED',
      windowTime: ['2020-08-31T02:00:00.000Z', '2020-08-31T03:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6749936',
              longitude: '100.5916773',
            },
          },
        },
      },
    },
    {
      _id: 't2',
      status: 'FAILED',
      windowTime: ['2020-08-31T01:00:00.000Z', '2020-08-31T02:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 10:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6766742',
              longitude: '100.645278',
            },
          },
        },
      },
    },
    {
      _id: 't3',
      status: 'FAILED',
      windowTime: ['2020-08-31T11:00:00.000Z', '2020-08-31T12:00:00.000Z'],
      information: {
        metaInformation: {
          extraInformation: {
            queue: 'A',
          },
          baseInformation: {
            standardTimeLength: 30,
            deadline: '2020-08-31 12:00:00',
          },
          orderBaseInformation: {
            areaCode: 103202010000,
            location: {
              latitude: '13.6882703',
              longitude: '100.5911328',
            },
          },
        },
      },
    },
  ],
  distanceMatrixResp: defaultDistanceMatrixResp,
}
