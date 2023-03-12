import { CreditWalletSettlementDomain } from './creditWalletSettlement'
import { todo, task, taskRequireTxRef } from './creditWalletSettlement.mock'
import { todoRepo } from '../../models/implementations/todoRepo'
import { ValidateError, CreditWalletFailed } from '../../constants/error'
import { ITodoRepo } from '../../models/implementations/todoRepo'
import config from '../../config'

jest.mock('../../config')
jest.mock('../staff/view')

const WeomniWallet: IWeomniWallet = {
  searchWallet: jest.fn(),
  capture: jest.fn(),
  withdrawal: jest.fn(),
}

const TodoRepo: ITodoRepo = {
  updateById: jest.fn(),
  updateStatus: jest.fn(),
}

const creditWalletSettlementDomain = new CreditWalletSettlementDomain(WeomniWallet, TodoRepo)

describe('Credit Wallet Settlement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('The consumer should be able to call new() on creditWalletSettlementDomain', () => {
    expect(creditWalletSettlementDomain).toBeTruthy()
  })

  it('Should capture then withdrawal', async () => {
    config.weomni.wallet.sendit.id = 12

    WeomniWallet.withdrawal.mockResolvedValue({})
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1 }])
    WeomniWallet.capture.mockResolvedValue({
      status: 'DONE',
    })

    const result = await creditWalletSettlementDomain.settlement('user_0', {
      ...todo,
      todoType: {
        code: 'SET_OFF',
        name: 'SETOFF',
      },
      taskId: {
        ...task,
        taskTypeId: {
          code: 'DELIVERY',
        },
        status: 'PENDING',
      },
    })

    expect(result.userId).toEqual('user_0')
  })

  it('Should do not capture or withdrawal', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1 }])

    const result = await creditWalletSettlementDomain.settlement('user_0', {
      ...todo,
      result: { capturedAt: 'today', withdrawalAt: 'yesterday' },
      todoType: {
        code: 'SET_OFF',
        name: 'SETOFF',
      },
      taskId: {
        ...task,
        taskTypeId: {
          code: 'DELIVERY',
        },
        status: 'PENDING',
      },
    })

    expect(result).toEqual({ capturedAt: 'today', withdrawalAt: 'yesterday', userId: 'user_0' })
  })

  it('Should capture failed validate', async () => {
    await expect(
      creditWalletSettlementDomain.settlement('user_0', {
        ...todo,
        taskId: {
          tripId: {
            payment: 'xxx',
          },
        },
      }),
    ).rejects.toThrow(ValidateError)
  })

  it('Should capture failed', async () => {
    config.weomni.wallet.sendit.id = 12

    WeomniWallet.withdrawal.mockResolvedValue({})
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1 }])

    WeomniWallet.capture.mockRejectedValue(new Error('failed capture'))

    try {
      await creditWalletSettlementDomain.settlement('user_0', {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'DELIVERY',
          },
          status: 'PENDING',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })

  it('Should withdrawal failed', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.capture.mockResolvedValue(true)
    WeomniWallet.withdrawal.mockRejectedValue(new Error('failed withdrawal'))
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1 }])

    WeomniWallet.capture.mockResolvedValue({
      status: 'DONE',
    })

    try {
      await creditWalletSettlementDomain.settlement('user_0', {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'DELIVERY',
          },
          status: 'PENDING',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })

  it('Should withdrawal failed Validate', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.capture.mockResolvedValue(true)
    WeomniWallet.withdrawal.mockRejectedValue(new ValidateError('failed withdrawal Validate'))
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1 }])

    WeomniWallet.capture.mockResolvedValue({
      status: 'DONE',
    })

    try {
      await creditWalletSettlementDomain.settlement('user_0', {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...task,
          taskTypeId: {
            code: 'DELIVERY',
          },
          status: 'PENDING',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidateError)
    }
  })

  it('Should required txRef', async () => {
    await expect(
      creditWalletSettlementDomain.settlement('user_0', {
        ...todo,
        todoType: {
          code: 'SET_OFF',
          name: 'SETOFF',
        },
        taskId: {
          ...taskRequireTxRef,
          taskTypeId: {
            code: 'DELIVERY',
          },
          status: 'PENDING',
        },
      }),
    ).rejects.toThrow('txRef is required')
  })
})
