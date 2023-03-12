// @flow
import { TripDomain } from './trip'
import { taskRepo } from '../../models/implementations/taskRepo'
import { tripRepo } from '../../models/implementations/tripRepo'
import { workflow } from '../workflow/index'
import { fleetApiService } from '../../adapters/restClient/fleet'
import { weomniWallet } from  '../weomni/index'
import { CreditWalletAcceptDomain } from '../weomni/creditWalletAccept'

export const creditWalletAcceptDomain = new CreditWalletAcceptDomain(weomniWallet, fleetApiService)
export const tripDomain = new TripDomain(tripRepo, taskRepo, workflow, fleetApiService, weomniWallet, creditWalletAcceptDomain)
