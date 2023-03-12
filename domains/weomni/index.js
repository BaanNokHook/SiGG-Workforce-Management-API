// @flow
import { WeomniWallet } from './wallet'
import { CreditWalletAcceptDomain } from './creditWalletAccept'
import { CreditWalletSettlementDomain } from './creditWalletSettlement'
import { WeomniDriver } from './driver'
import { todoRepo } from '../../models/implementations/todoRepo'
import { fleetApiService } from '../../adapters/restClient/fleet'

export const weomniWallet = new WeomniWallet()
export const weomniDriver = new WeomniDriver()
export const creditWalletAcceptDomain = new CreditWalletAcceptDomain(weomniWallet, fleetApiService)
export const creditWalletSettlementDomain = new CreditWalletSettlementDomain(
  weomniWallet,
  todoRepo,
  fleetApiService,
)
