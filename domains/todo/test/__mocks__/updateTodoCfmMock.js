const mockUser = {
  trueIdUid: 'trueIdUid',
  lastname: 'lastname',
  firstname: 'firstname',
}

export const mockStaff = {
  metaData: {
    staffCode: 'staffCode',
  },
  firstname: 'firstname',
  lastname: 'lastname',
}

const mockTodo = {
  todoType: {
    name: 'ENTER_SITE',
    companyId: 'companyId',
    projectId: 'projectId',
  },
  taskId: {
    information: {
      recNo: 'recNo',
      ticketNo: 'ticketNumber',
      prodId: 'productID',
      ticketInfo: {
        techID1: 'techID1',
        techID2: 'techID2',
      },
    },
    orderId: 'orderId',
    taskTypeId: 'mockId',
  },
}

export const result = {
  dispositions: [
    {
      data: [
        { key: 'causecode1', value: 'causecode1' },
        { key: 'dispositioncode1', value: 'dispositioncode1' },
        { key: 'workcode1', value: 'workcode1' },
      ],
      sequence: '1',
    },
    {
      data: [
        { key: 'causecode2', value: 'causecode2' },
        { key: 'dispositioncode2', value: 'dispositioncode2' },
        { key: 'workcode2', value: 'workcode2' },
      ],
      sequence: '2',
    },
  ],
  e2e: {
    testResult: 'Pass',
    testDate: '01/01/2020 00:00:00',
  },
}

export const payloadMock = {
  user: mockUser,
  todo: mockTodo,
  staff: mockStaff,
}

export default {
  payloadMock,
  result,
}
