import { GenerateSequenceId } from './generateSequenceId'

const mockGenerateNextSequence = jest.fn()
describe('Generate Sequence Id', () => {
  const domain = new GenerateSequenceId(mockGenerateNextSequence)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate new accept trip reference id', async () => {
    mockGenerateNextSequence.mockResolvedValue(1)

    const result = await domain.acceptTripReferenceId({}, 5, '2021-06-30T16:59:59.999Z')

    expect(result).toEqual('JUN00001')
    expect(mockGenerateNextSequence).toBeCalledWith('JUN', '2021-06-30T16:59:59.999Z')
  })

  it('should use exited accept trip reference id', async () => {
    const result = await domain.acceptTripReferenceId(
      { acceptTripReferenceId: 'JUN00012' },
      5,
      '2021-06-30T16:59:59.999Z',
    )

    expect(result).toEqual('JUN00012')
    expect(mockGenerateNextSequence).not.toBeCalled()
  })
})
