import config from '../../config'
import KafkaProducerAdapter, { ProduceInput } from '../../adapters/kafkaBroker/kafkaProducerAdapter'

export type UpdateTodoCFMRequest = {
  productID: string,
  ticketNumber: string,
  actionName: string,
  actionDate: string,
  actionID: string,
  updID: string,
  updName: string,
  companyId: string,
  projectId: string,
  requestType: string,
  actionType: string,
  workOrderNO?: string,
  ackID?: string,
  ackCode?: string,
  causeCode1?: string,
  causeCode2?: string,
  closeID?: string,
  closeName?: string,
  dispositionCode1?: string,
  dispositionCode2?: string,
  responseName?: string,
  techID1?: string,
  techID2?: string,
  workCode1?: string,
  workCode2?: string,
  reason1?: string,
  reason2?: string,
  remark?: string,
  testID?: string,
  testName?: string,
  testResult?: string,
  testDate?: string,
}

const assistantTaskTypeId = '5d779979544d1030fb52d68a'
class Cfm {
  updateWorkOrderStatus(payload: UpdateTodoCFMRequest, taskTypeId: string): any {
    if (taskTypeId.toString() === assistantTaskTypeId) return false

    const data: ProduceInput = {
      topic: config.kafka.topic.tmsTodo,
      payload,
      key: payload.workOrderNO,
    }
    return KafkaProducerAdapter.produce(data)
  }
}

export default new Cfm()
