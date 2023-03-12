import updateTripMetadata from '../trip/updateMetadata'
import { CreditWalletAcceptDomain } from './creditWalletAccept'
import { metaData, trip } from './creditWalletAccept.mock'
import R from 'ramda'
import { CreditWalletFailed } from '../../constants/error'
import config from '../../config'
import type { IFleetApiService } from '../../adapters/restClient/fleet'

jest.mock('../trip/updateMetadata')
jest.mock('../../config')

const WeomniWallet: IWeomniWallet = {
  searchWallet: jest.fn(),
  release: jest.fn(),
  withdrawal: jest.fn(),
}

const FleetApiService: IFleetApiService = {
  getStaff: jest.fn(),
  deleteStaffFromStaffOrderTicket: jest.fn(),
}

const creditWalletAcceptDomain = new CreditWalletAcceptDomain(WeomniWallet, FleetApiService)

describe('credit wallet accept domain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should hold withdrawal', async () => {
    WeomniWallet.searchWallet.mockResolvedValue([{ id: '140805' }])
    WeomniWallet.withdrawal.mockResolvedValue({
      id: 140805,
      projectId: '60f651fa349cdb000169de1c',
      action: 'hold',
      txDate: '2021-08-03T08:04:17.278988Z',
      txRef: '21LOTUS-AA1185-80a7fead',
      parentTxRef: null,
      txAmount: -1.2,
      from: 95757,
      to: 95758,
      note: null,
      tags: ['Lotus 5038: HY: BANGKAPI (DotCom)', 'Lotus'],
    })
    const result = await creditWalletAcceptDomain.holdWithdrawal('userId', trip)
    expect(result).toEqual({
      id: 140805,
      projectId: '60f651fa349cdb000169de1c',
      action: 'hold',
      txDate: '2021-08-03T08:04:17.278988Z',
      txRef: '21LOTUS-AA1185-80a7fead',
      parentTxRef: null,
      txAmount: -1.2,
      from: 95757,
      to: 95758,
      note: null,
      tags: ['Lotus 5038: HY: BANGKAPI (DotCom)', 'Lotus'],
    })
  })

  it('should failed hold withdraw', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.withdrawal.mockResolvedValue(true)
    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1234 }])
    updateTripMetadata.mockRejectedValue(new Error('test'))

    try {
      await creditWalletAcceptDomain.holdWithdrawal('userId', trip)
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })

  it('should throw userId is required', async () => {
    await expect(creditWalletAcceptDomain.getWalletId(null)).rejects.toThrow('userId is required')
  })

  it('should not found wallet id', async () => {
    WeomniWallet.searchWallet.mockResolvedValue(null)
    await expect(creditWalletAcceptDomain.getWalletId('user_id')).rejects.toThrow(
      'wallet id by user id user_id not found on Weomni',
    )
  })

  it('should release hold withdraw', async () => {
    WeomniWallet.release.mockResolvedValue(true)
    const result = await creditWalletAcceptDomain.releaseHoldWithdrawal(
      'userId',
      'tripId',
      'weomniTxRef',
    )
    expect(WeomniWallet.release).toHaveBeenCalledWith({
      txRef: `weomniTxRef-release`,
      holdTxRef: `weomniTxRef`,
    })
    expect(result).toEqual(true)
  })
  it('should release hold withdraw failed', async () => {
    WeomniWallet.release.mockRejectedValue(new Error('Async error'))
    await expect(
      creditWalletAcceptDomain.releaseHoldWithdrawal('userId', 'tripId', 'weomniTxRef'),
    ).rejects.toThrow('Async error')
    expect(WeomniWallet.release).toHaveBeenCalledWith({
      txRef: `weomniTxRef-release`,
      holdTxRef: `weomniTxRef`,
    })
  })

  it('should failed hold withdraw error insufficientfund delete staff ticket success', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.withdrawal.mockRejectedValue({
      data: {
        entityName: 'wallet',
        errorKey: 'NSF',
        type: 'https://www.jhipster.tech/problem/problem-with-message',
        title: 'InsufficientFund',
        status: 402,
        message: 'error.NSF',
        params: 'wallet',
      },
    })

    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1234 }])

    FleetApiService.getStaff.mockResolvedValue({ _id: '111' })
    FleetApiService.deleteStaffFromStaffOrderTicket.mockResolvedValue({
      data: {
        statusCodes: 200,
      },
    })

    try {
      await creditWalletAcceptDomain.holdWithdrawal('userId', trip)
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })

  it('should failed hold withdraw error insufficientfund delete staff ticket fail', async () => {
    config.weomni.wallet.sendit.id = 12
    WeomniWallet.withdrawal.mockRejectedValue({
      data: {
        entityName: 'wallet',
        errorKey: 'NSF',
        type: 'https://www.jhipster.tech/problem/problem-with-message',
        title: 'InsufficientFund',
        status: 402,
        message: 'error.NSF',
        params: 'wallet',
      },
    })

    WeomniWallet.searchWallet.mockResolvedValue([{ id: 1234 }])

    FleetApiService.getStaff.mockResolvedValue({ _id: '111' })
    FleetApiService.deleteStaffFromStaffOrderTicket.mockResolvedValue({
      data: {
        statusCodes: 400,
      },
    })

    try {
      await creditWalletAcceptDomain.holdWithdrawal('userId', trip)
    } catch (error) {
      expect(error).toBeInstanceOf(CreditWalletFailed)
    }
  })
})
