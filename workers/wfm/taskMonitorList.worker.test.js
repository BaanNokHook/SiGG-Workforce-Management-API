import { mockClear } from 'jest-mock-extended'
import { TaskMonitorListEsClient } from '../../services/elasticsearch/taskMonitorListEsClient'
import { TaskMonitorList } from './taskMonitorList.worker'

jest.mock('../../services/elasticsearch/taskMonitorListEsClient')

describe('Set task monitor list data to elasticsearch worker', () => {
  beforeEach(() => {
    mockClear(TaskMonitorListEsClient)
  })

  test('Task monitor list worker initial its elastic client properly', () => {
    const taskMonitorListWorker = new TaskMonitorList({
      consumerGroupId: 'test-group',
      topic: 'test',
    })
    expect(TaskMonitorListEsClient).toHaveBeenCalledTimes(1)
  })
})
