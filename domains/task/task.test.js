import { TaskDomain } from './task'
import { ValidateError } from '../../constants/error'

const mockTaskRepo = {
  updateStatus: jest.fn(),
  updateMany: jest.fn(),
  isHasTasks: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  updateParcelsAndPayment: jest.fn(),
}

const mockTripRepo = {
  getActiveTripByOrderId: jest.fn(),
  updatePayment: jest.fn(),
}

describe('Task domain', () => {
  const taskDomain = new TaskDomain(mockTaskRepo, mockTripRepo)

  beforeEach(() => {
    mockTaskRepo.updateStatus.mockClear()
    mockTaskRepo.updateMany.mockClear()
    mockTaskRepo.isHasTasks.mockClear()
    mockTaskRepo.find.mockClear()
    mockTaskRepo.update.mockClear()
    mockTaskRepo.updateParcelsAndPayment.mockClear()
    mockTripRepo.getActiveTripByOrderId.mockClear()
    mockTripRepo.updatePayment.mockClear()
  })

  it('The consumer should be able to call new() on TaskDomain', () => {
    expect(taskDomain).toBeTruthy()
  })

  describe('Should update single task status', () => {
    it('Should call method update single task status', async () => {
      mockTaskRepo.isHasTasks.mockResolvedValue(true)
      mockTaskRepo.updateStatus.mockResolvedValue(Promise.resolve({ status: 'FAILED' }))

      const result = await taskDomain.updateSingleTaskStatus({ tasks: '1', status: 'FAILED' })
      expect(mockTaskRepo.isHasTasks).toHaveBeenCalled()
      expect(mockTaskRepo.updateStatus).toHaveBeenCalled()
      expect(result).toEqual({ status: 'FAILED' })
    })
  })

  describe('Should not update single task status', () => {
    it(`Don't have task in system, should throw Error with message "Not allowed to update status of task, not have task in system"`, async () => {
      mockTaskRepo.isHasTasks.mockResolvedValue(false)

      function notHaveTaskInSystem() {
        return taskDomain.updateSingleTaskStatus({ tasks: '1', status: 'FAILED' })
      }

      expect(notHaveTaskInSystem()).rejects.toThrowError(
        `Not allowed to update status of task, not have task in system`,
      )
      expect(mockTaskRepo.updateStatus).not.toHaveBeenCalled()
    })
  })

  describe('Should update all task status', () => {
    it('Should call method update all task status', async () => {
      mockTaskRepo.isHasTasks.mockResolvedValue(true)
      mockTaskRepo.updateMany.mockResolvedValue(Promise.resolve({ ok: 1 }))

      const result = await taskDomain.updateAllTaskStatus({
        tasks: ['1', '2', '3'],
        status: 'FAILED',
      })
      expect(mockTaskRepo.updateMany).toHaveBeenCalled()
      expect(result).toEqual({ ok: 1 })
    })
  })

  describe('Should not update all task status', () => {
    it(`Don't have task in system, should throw Error with message "Not allowed to update status of task, not have task in system"`, async () => {
      mockTaskRepo.isHasTasks.mockResolvedValue(false)

      function notHaveTaskInSystem() {
        return taskDomain.updateAllTaskStatus({ tasks: ['1', '2', '3'], status: 'FAILED' })
      }

      expect(notHaveTaskInSystem()).rejects.toThrowError(
        `Not allowed to update status of task, not have task in system`,
      )
      expect(mockTaskRepo.updateStatus).not.toHaveBeenCalled()
    })
  })

  it('should update task status by orderId', async () => {
    mockTaskRepo.update.mockResolvedValue({ taskId: 'taskId01', orderId: 'orderId01' })

    const result = await taskDomain.updateTaskStatusByOrderId('orderId01', 'CANCELLED')

    expect(mockTaskRepo.update).toBeCalledWith({ orderId: 'orderId01' }, { status: 'CANCELLED' })
    expect(result).toEqual({ taskId: 'taskId01', orderId: 'orderId01' })
  })

  it('should update task information by orderId', async () => {
    mockTaskRepo.update.mockResolvedValue({ taskId: 'taskId01', orderId: 'orderId01' })

    const result = await taskDomain.updateTaskInformationByOrderId(
      'orderId01',
      {
        createDate: '2021-05-07 15:00:00',
        customer: {
          custId: '123456789',
          custName: 'Happy james',
          custType: 'A',
        },
        productOrderList: [
          {
            appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
            prodOrderNo: '1234567890',
            prodEventCode: 'NEW',
            product: {
              accessMode: 'FTTH',
              serviceNo: '66123525215',
              prodInstld: 'old1234212151',
              prodSpecCode: 'HSI',
              areaCode: '100402080007',
            },
          },
        ],
        serviceOrderAttribute: [
          {
            attrCode: 'ADDRESS_LATITUDE',
            attrName: 'ADDRESS_LATITUDE',
            value: '13.6851519',
            valueDesc: '13.6851519',
          },
          {
            attrCode: 'ADDRESS_LONGITUDE',
            attrName: 'ADDRESS_LONGITUDE',
            value: '100.6091376',
            valueDesc: '100.6091376',
          },
        ],
      },
      {
        createDate: '2021-05-07 15:00:00',
        customer: {
          custId: '1234567890',
          custName: 'Happy fun',
          custType: 'B',
        },
        productOrderList: [
          {
            appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
            prodOrderNo: '1234567890',
            prodEventCode: 'NEW',
            product: {
              accessMode: 'FTTH',
              serviceNo: '66123525215',
              prodInstld: 'new1234212151',
              prodSpecCode: 'HSI',
              areaCode: '100402080007',
            },
          },
        ],
        serviceOrderAttribute: [
          {
            attrCode: 'NEW_ADDRESS_LATITUDE',
            attrName: 'ADDRESS_LATITUDE',
            value: '13.6851519',
            valueDesc: '13.6851519',
          },
          {
            attrCode: 'ADDRESS_LONGITUDE',
            attrName: 'ADDRESS_LONGITUDE',
            value: '100.6091376',
            valueDesc: '100.6091376',
          },
        ],
      },
    )

    expect(mockTaskRepo.update).toBeCalledWith(
      { orderId: 'orderId01' },
      {
        $set: {
          'information.metaInformation.installationInformation.serviceOrderInfo.customer': {
            custId: '1234567890',
            custName: 'Happy fun',
            custType: 'B',
          },
          'information.metaInformation.installationInformation.serviceOrderInfo.productOrderList': [
            {
              appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
              prodOrderNo: '1234567890',
              prodEventCode: 'NEW',
              product: {
                accessMode: 'FTTH',
                serviceNo: '66123525215',
                prodInstld: 'new1234212151',
                prodSpecCode: 'HSI',
                areaCode: '100402080007',
              },
            },
          ],
          'information.metaInformation.installationInformation.serviceOrderInfo.serviceOrderAttribute': [
            {
              attrCode: 'ADDRESS_LATITUDE',
              attrName: 'ADDRESS_LATITUDE',
              value: '13.6851519',
              valueDesc: '13.6851519',
            },
            {
              attrCode: 'ADDRESS_LONGITUDE',
              attrName: 'ADDRESS_LONGITUDE',
              value: '100.6091376',
              valueDesc: '100.6091376',
            },
          ],
        },
      }
    )
    expect(result).toEqual({ taskId: 'taskId01', orderId: 'orderId01' })
  })

  it('should update multi task information by orderId', async () => {
    mockTaskRepo.updateMany.mockResolvedValue({
      n: 1,
      nModified: 1,
      electionId: "7fffffff000000000000005c",
      ok: 1,
      operationTime: "7005842312685158402"
  })

    const result = await taskDomain.updateMultiTaskInformationByOrderId(
      'orderId01',
      {
        createDate: '2021-05-07 15:00:00',
        customer: {
          custId: '123456789',
          custName: 'Happy james',
          custType: 'A',
        },
        productOrderList: [
          {
            appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
            prodOrderNo: '1234567890',
            prodEventCode: 'NEW',
            product: {
              accessMode: 'FTTH',
              serviceNo: '66123525215',
              prodInstld: 'old1234212151',
              prodSpecCode: 'HSI',
              areaCode: '100402080007',
            },
          },
        ],
        serviceOrderAttribute: [
          {
            attrCode: 'ADDRESS_LATITUDE',
            attrName: 'ADDRESS_LATITUDE',
            value: '13.6851519',
            valueDesc: '13.6851519',
          },
          {
            attrCode: 'ADDRESS_LONGITUDE',
            attrName: 'ADDRESS_LONGITUDE',
            value: '100.6091376',
            valueDesc: '100.6091376',
          },
        ],
      },
      {
        createDate: '2021-05-07 15:00:00',
        customer: {
          custId: '1234567890',
          custName: 'Happy fun',
          custType: 'B',
        },
        productOrderList: [
          {
            appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
            prodOrderNo: '1234567890',
            prodEventCode: 'NEW',
            product: {
              accessMode: 'FTTH',
              serviceNo: '66123525215',
              prodInstld: 'new1234212151',
              prodSpecCode: 'HSI',
              areaCode: '100402080007',
            },
          },
        ],
        serviceOrderAttribute: [
          {
            attrCode: 'NEW_ADDRESS_LATITUDE',
            attrName: 'ADDRESS_LATITUDE',
            value: '13.6851519',
            valueDesc: '13.6851519',
          },
          {
            attrCode: 'ADDRESS_LONGITUDE',
            attrName: 'ADDRESS_LONGITUDE',
            value: '100.6091376',
            valueDesc: '100.6091376',
          },
        ],
      },
    )

    expect(mockTaskRepo.updateMany).toBeCalledWith(
      { orderId: 'orderId01' },
      {
        $set: {
          'information.metaInformation.installationInformation.serviceOrderInfo.customer': {
            custId: '1234567890',
            custName: 'Happy fun',
            custType: 'B',
          },
          'information.metaInformation.installationInformation.serviceOrderInfo.productOrderList': [
            {
              appointNo: '677da8a7-2294-4a4a-8503-efbc1e9f52ca',
              prodOrderNo: '1234567890',
              prodEventCode: 'NEW',
              product: {
                accessMode: 'FTTH',
                serviceNo: '66123525215',
                prodInstld: 'new1234212151',
                prodSpecCode: 'HSI',
                areaCode: '100402080007',
              },
            },
          ],
          'information.metaInformation.installationInformation.serviceOrderInfo.serviceOrderAttribute': [
            {
              attrCode: 'ADDRESS_LATITUDE',
              attrName: 'ADDRESS_LATITUDE',
              value: '13.6851519',
              valueDesc: '13.6851519',
            },
            {
              attrCode: 'ADDRESS_LONGITUDE',
              attrName: 'ADDRESS_LONGITUDE',
              value: '100.6091376',
              valueDesc: '100.6091376',
            },
          ],
        },
      }
    )
    expect(result).toEqual({
      n: 1,
      nModified: 1,
      electionId: "7fffffff000000000000005c",
      ok: 1,
      operationTime: "7005842312685158402"
  })
  })

  describe('Should update task items', () => {
    it('should update task items success', async () => {
      const orderId = 'orderId01'
      mockTripRepo.getActiveTripByOrderId.mockResolvedValue({ detailStatus: 'ACCEPT_TRIP.ACCEPT_TRIP.DOING',  metadata: { consignment: 'orderId0101' }})
      mockTaskRepo.updateParcelsAndPayment.mockResolvedValue(buildMockUpdateParcelsAndPaymentData())
      mockTripRepo.updatePayment.mockResolvedValue(true)

      const result = await taskDomain.updateTasksItems({
        orderId: 'orderId01',
        tasks: [
          {
            taskId: "tasktest01",
            taskRefId: "REF1-1112",
            information: {
              parcels: [
                {
                  consignment: "",
                  productId: "SKU00010",
                  name: "Coke 250 ml.",
                  type: "PRODUCTS",
                },
                {
                  productId: "Buy1Get1Free",
                  name: "Promotion Coke Buy1Get1Free",
                  type: "PROMOCODE",
                  quantity: 10,
                  price: -10,
                  payment: {
                    actual: -10,
                    amount: -10
                  }
                }
              ],
              payment: {
                description: "POSTPAID",
                extraCODAmount: 100,
                method: "POSTPAID"
              },
            },
          },
        ]
      })

      expect(mockTripRepo.getActiveTripByOrderId).toHaveBeenCalledWith(orderId)
      expect(mockTaskRepo.updateParcelsAndPayment).toHaveBeenCalledWith(
        'tasktest01',
        {
          parcels:
            [
              {
                consignment: '',
                name: 'Coke 250 ml.',
                productId: 'SKU00010',
                type: 'PRODUCTS'
              },
              {
                name: 'Promotion Coke Buy1Get1Free',
                payment:
                  {
                    actual: -10,
                    amount: -10
                  },
                price: -10,
                productId: 'Buy1Get1Free',
                quantity: 10,
                type: 'PROMOCODE'
              }
          ],
        payment:
          {
            description: 'POSTPAID',
            extraCODAmount: 100,
            method: 'POSTPAID'
          }
        }
      )
      expect(mockTripRepo.updatePayment).toHaveBeenCalledWith(orderId, {amount: 0, extraCODAmount: 0, method: 'PREPAID'})
      expect(result).toEqual({
        orderId: 'orderId01',
        consignment: 'orderId0101',
        tasks: [
            {
              tripId: '61137c13dc14b838c903de9c',
              sequenceSystem: 2,
              sequenceManual: 0,
              todos: [
                "61137822332a690011b99aa4",
                "61137822332a690011b99aa7"
              ],
              deliveryStatus: 'DELIVER',
              information: {
                parcels: [
                  {
                    consignment: "",
                    productId: "SKU00010",
                    name: "Coke 250 ml.",
                    type: "PRODUCTS",
                  },
                ]
              }
            }
        ]
      })
    })

    it('should update task items error order is not allow update', async () => {
      mockTripRepo.getActiveTripByOrderId.mockResolvedValue({ detailStatus: 'ORDER_FAILED',  metadata: { consignment: 'orderId0101' }})

      function notAllowUpdateTaskItems() {
        return taskDomain.updateTasksItems({
          orderId: 'orderId01',
          tasks: [
            {
              taskId: "tasktest01",
              taskRefId: "REF1-1112",
              information: {
                parcels: [
                  {
                    consignment: "",
                    productId: "SKU00010",
                    name: "Coke 250 ml.",
                    type: "PRODUCTS",
                  },
                  {
                    productId: "Buy1Get1Free",
                    name: "Promotion Coke Buy1Get1Free",
                    type: "PROMOCODE",
                    quantity: 10,
                    price: -10,
                    payment: {
                      actual: -10,
                      amount: -10
                    }
                  }
                ],
                payment: {
                  description: "POSTPAID",
                  extraCODAmount: 100,
                  method: "POSTPAID"
                },
              },
            },
          ]
        })
      }

      await expect(notAllowUpdateTaskItems()).rejects.toThrow(ValidateError)
    })
  })
})

function buildMockUpdateParcelsAndPaymentData() {
  return {
    tripId: "61137c13dc14b838c903de9c",
    sequenceSystem: 2,
    sequenceManual: 0,
    todos: [
      "61137822332a690011b99aa4",
      "61137822332a690011b99aa7"
    ],
    deliveryStatus: "DELIVER",
    information: {
      parcels: [
        {
          consignment: "",
          productId: "SKU00010",
          name: "Coke 250 ml.",
          type: "PRODUCTS",
        },
      ]
    }
  }
}

