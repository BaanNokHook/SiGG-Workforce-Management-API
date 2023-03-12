import { WfmTasksSearch } from './search'

describe('WFM Search Tasks (elasticsearch)', () => {
  const taskMonitorListEsClient = {
    search: jest.fn(),
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  const wfmTasksSearch = new WfmTasksSearch(taskMonitorListEsClient)

  it('should search tasks correctly', async () => {
    const mockParams = { bodyRequest: {}, options: {} }
    taskMonitorListEsClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [
            { _id: 'mockTask_id1', _source: { status: 'NEW', priorityName: 'NORMAL' } },
            { _id: 'mockTask_id2', _source: { status: 'TODO', priorityName: 'MEDIUM' } },
          ],
          total: 2,
        },
      },
    })
    const result = await wfmTasksSearch.search(mockParams)
    expect(result).toStrictEqual({
      data: [
        { _id: 'mockTask_id1', priorityName: 'NORMAL', status: 'NEW' },
        { _id: 'mockTask_id2', priorityName: 'MEDIUM', status: 'TODO' },
      ],
      hasNext: false,
      limit: 100,
      numberOfPage: 1,
      page: 1,
      total: 2,
    })
  })

  it('should return empty array when data was not be found', async () => {
    const mockParams = { bodyRequest: {}, options: {} }
    taskMonitorListEsClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [],
          total: 0,
        },
      },
    })
    const result = await wfmTasksSearch.search(mockParams)
    expect(result.data.length).toEqual(0)
  })

  it('should throw error when elasticsearch error', async () => {
    const mockParams = { bodyRequest: {}, options: {} }
    taskMonitorListEsClient.search.mockRejectedValue(new Error('Something Error'))
    await expect(wfmTasksSearch.search(mockParams)).rejects.toThrowError(`Something Error`)
  })
})
