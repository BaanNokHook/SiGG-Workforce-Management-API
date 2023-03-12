export const mockData = {
  input: {
    transactionId: 'tx',
    input: {
      orders: [
        {
          orderId: 'order1',
          staff: {
            _id: 'staff',
          },
          address: {},
          companyId: 'com',
          projectId: 'pro',
          taskType: {
            _id: 'id',
            durationTime: 0,
          },
          metaInformation: {
            installationInformation: {
              customerName: 'name',
              contactPhone: 'phone',
              contactName:'name2',
              installationDate: '2021-01-06',
              timeSlot: '08:00-12:00',
            },
          },
        },
        {
          orderId: 'order2',
          staff: {
            _id: 'staff',
          },
          address: {},
          companyId: 'com',
          projectId: 'pro',
          taskType: {
            _id: 'id',
            durationTime: 0,
          },
          metaInformation: {
            installationInformation: {
              customerName: 'name',
              contactPhone: 'phone',
              contactName:'name2',
              installationDate: '2021-01-06',
              timeSlot: '13:00-16:00',
            },
          },
        },
        {
          orderId: 'order3',
          staff: {
            _id: 'staff',
          },
          address: {},
          companyId: 'com',
          projectId: 'pro',
          taskType: {
            _id: 'id',
            durationTime: 0,
          },
          metaInformation: {
            installationInformation: {
              customerName: 'name',
              contactPhone: 'phone',
              contactName:'name2',
              installationDate: '2021-01-06',
              timeSlot: '15:00-18:00',
            },
          },
        },
      ]
    },
  },
  expect: {
    'output': {
      'input': {
        'orders': [
          {
            'orderId': 'order1',
            'staff': {
              '_id': 'staff',
            },
            'address': {},
            'companyId': 'com',
            'projectId': 'pro',
            'taskType': {
              '_id': 'id',
              'durationTime': 0,
            },
            'metaInformation': {
              'installationInformation': {
                'customerName': 'name',
                'contactPhone': 'phone',
                'contactName': 'name2',
                'installationDate': '2021-01-06',
                'timeSlot': '08:00-12:00',
              },
            },
          },
          {
            'orderId': 'order2',
            'staff': {
              '_id': 'staff',
            },
            'address': {},
            'companyId': 'com',
            'projectId': 'pro',
            'taskType': {
              '_id': 'id',
              'durationTime': 0,
            },
            'metaInformation': {
              'installationInformation': {
                'customerName': 'name',
                'contactPhone': 'phone',
                'contactName': 'name2',
                'installationDate': '2021-01-06',
                'timeSlot': '13:00-16:00',
              },
            },
          },
          {
            'orderId': 'order3',
            'staff': {
              '_id': 'staff',
            },
            'address': {},
            'companyId': 'com',
            'projectId': 'pro',
            'taskType': {
              '_id': 'id',
              'durationTime': 0,
            },
            'metaInformation': {
              'installationInformation': {
                'customerName': 'name',
                'contactPhone': 'phone',
                'contactName': 'name2',
                'installationDate': '2021-01-06',
                'timeSlot': '15:00-18:00',
              },
            },
          },
        ],
      },
      'transactionId': 'tx',
      'baseModel': {
        'tasks': [
          {
            'address': {},
            'information': {
              'ticketInfo':  {
                'contactMobile1': 'phone',
                'contactName': 'name2',
                'customerName': 'name',
              },
              'contactInformation': {
                'name': 'name',
                'phone': 'phone',
              },
              'metaInformation': {
                'installationInformation': {
                  'customerName': 'name',
                  'contactPhone': 'phone',
                  'contactName': 'name2',
                  'installationDate': '2021-01-06',
                  'timeSlot': '08:00-12:00',
                },
              },
            },
            'appointment': {
              'appointmentFrom': '2021-01-06T01:00:00.000Z',
              'appointmentTo': '2021-01-06T05:00:00.000Z',
              'appointmentDate': '2021-01-06',
            },
            'staffs': [
              'staff',
            ],
            'direction': 'REPAIR',
            'companyId': 'com',
            'projectId': 'pro',
            'note': '',
            'taskType': 'id',
            'windowTime': [
              '2021-01-06T01:00:00.000Z',
              '2021-01-06T05:00:00.000Z',
            ],
            'standardTimeLength': 0,
            'orderId': 'order1',
          },
          {
            'address': {},
            'information': {
              'ticketInfo':  {
                'contactMobile1': 'phone',
                'contactName': 'name2',
                'customerName': 'name',
              },
              'contactInformation': {
                'name': 'name',
                'phone': 'phone',
              },
              'metaInformation': {
                'installationInformation': {
                  'customerName': 'name',
                  'contactPhone': 'phone',
                  'contactName': 'name2',
                  'installationDate': '2021-01-06',
                  'timeSlot': '13:00-16:00',
                },
              },
            },
            'appointment': {
              'appointmentFrom': '2021-01-06T06:00:00.000Z',
              'appointmentTo': '2021-01-06T09:00:00.000Z',
              'appointmentDate': '2021-01-06',
            },
            'staffs': [
              'staff',
            ],
            'direction': 'REPAIR',
            'companyId': 'com',
            'projectId': 'pro',
            'note': '',
            'taskType': 'id',
            'windowTime': [
              '2021-01-06T06:00:00.000Z',
              '2021-01-06T09:00:00.000Z',
            ],
            'standardTimeLength': 0,
            'orderId': 'order2',
          },
          {
            'address': {},
            'information': {
              'ticketInfo':  {
                'contactMobile1': 'phone',
                'contactName': 'name2',
                'customerName': 'name',
              },
              'contactInformation': {
                'name': 'name',
                'phone': 'phone',
              },
              'metaInformation': {
                'installationInformation': {
                  'customerName': 'name',
                  'contactPhone': 'phone',
                  'contactName': 'name2',
                  'installationDate': '2021-01-06',
                  'timeSlot': '15:00-18:00',
                },
              },
            },
            'appointment': {
              'appointmentFrom': '2021-01-06T08:00:00.000Z',
              'appointmentTo': '2021-01-06T11:00:00.000Z',
              'appointmentDate': '2021-01-06',
            },
            'staffs': [
              'staff',
            ],
            'direction': 'REPAIR',
            'companyId': 'com',
            'projectId': 'pro',
            'note': '',
            'taskType': 'id',
            'windowTime': [
              '2021-01-06T08:00:00.000Z',
              '2021-01-06T11:00:00.000Z',
            ],
            'standardTimeLength': 0,
            'orderId': 'order3',
          },
        ],
        'extensionType': 'QRUN',
        'extensionFlow': 'WFM_CREATE_TRIP',
        'note': '',
        'orderId': 'order1',
      },
    },
    'status': 'COMPLETED',
  },
};
