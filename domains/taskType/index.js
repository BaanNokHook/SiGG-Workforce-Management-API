// @flow
import { todoRepo } from '../../models/implementations/todoRepo'
import { urlShortenApiService } from '../../adapters/restClient/urlShorten'
import { dispatchApiService } from '../../adapters/restClient/dispatch'
import { fleetApiService } from '../../adapters/restClient/fleet'
import { taskRepo } from '../../models/implementations/taskRepo'
import { tripRepo } from '../../models/implementations/tripRepo'
import { workflow } from '../workflow/index'
import { AcceptTrip } from './acceptTrip'
import { PickUp } from './pickUp'
import { Delivery } from './delivery'
import { Return } from './return'
import { TaskTypeDispatcher } from './taskTypeDispatcher'
import { generateSequenceId } from '../generateSequenceId'
import { tripDomain } from '../trip'
import { creditWalletAcceptDomain, creditWalletSettlementDomain } from '../weomni'

export const acceptTrip = new AcceptTrip(
  todoRepo,
  taskRepo,
  tripRepo,
  workflow,
  fleetApiService,
  dispatchApiService,
  urlShortenApiService,
  generateSequenceId,
  tripDomain,
  creditWalletAcceptDomain,
)

export const pickUp = new PickUp(todoRepo, taskRepo, tripRepo)

export const delivery = new Delivery(todoRepo, taskRepo, tripRepo, creditWalletSettlementDomain)

export const deliveryReturn = new Return(todoRepo, taskRepo, tripRepo)

export const taskTypeDispatcher = new TaskTypeDispatcher(
  todoRepo,
  acceptTrip,
  pickUp,
  delivery,
  deliveryReturn,
  fleetApiService,
)
