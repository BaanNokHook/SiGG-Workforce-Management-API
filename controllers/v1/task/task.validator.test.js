import { isISOStringDateValid, findTasksValidator, findMonitorListTasksValidator } from './task.validator'

describe('isISOStringDateValid', () => {
  test('date is valid when date is iso date string', () => {
    const date = '2020-10-10T00:00:00.000Z'
    const isValid = isISOStringDateValid(date)
    expect(isValid).toBe(true)
  })

  test('date is invalid when date is unix time stamp (number)', () => {
    const date = 1601971271551
    const isValid = isISOStringDateValid(date)
    expect(isValid).toBe(false)
  })

  test('date is invalid when date is normal string', () => {
    const date = 'test'
    const isValid = isISOStringDateValid(date)
    expect(isValid).toBe(false)
  })
})

describe('findTasksValidator', () => {
  const next = jest.fn()

  afterEach(() => {
    next.mockClear()
  })

  test('if start time is not string, it must throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: 1,
          endTime: '2020-11-10T00:00:00.000Z',
        },
      },
    }

    await expect(findTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  test('if end time is not string, it must throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: 1,
        },
      },
    }

    await expect(findTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'endTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  test('if start time is undefined, it must not throw error', async () => {
    const ctx = {
      request: {
        body: {
          endTime: '2020-10-10T00:00:00.000Z',
        },
      },
    }

    await findTasksValidator(ctx, next)

    expect(next).toBeCalled()
  })

  test('if end time is undefined, it must not throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
        },
      },
    }

    await findTasksValidator(ctx, next)

    expect(next).toBeCalled()
  })

  test('if start time is not iso date string, it must throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: 'x',
          endTime: '2020-10-10T00:00:00.000Z',
        },
      },
    }

    await expect(findTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  test('if end time is not iso date string, it must throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: 'x',
        },
      },
    }

    await expect(findTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'endTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  test('if start time greater than end time, it must throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-11-11T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
        },
      },
    }

    await expect(findTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be less than endTime',
    })

    expect(next).not.toBeCalled()
  })

  test('if start time and end time are valid, it must not throw error', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
        },
      },
    }

    await findTasksValidator(ctx, next)

    expect(next).toBeCalled()
  })
})

describe('findMonitorListTasksValidator', () => {
  const next = jest.fn()

  afterEach(() => {
    next.mockClear()
  })

  it('should throw error when start time is not iso date string', async () => {
    const ctx = {
      request: {
        body: {
          startTime: 1,
          endTime: '2020-11-10T00:00:00.000Z',
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be a ISO date string',
    })
    
    expect(next).not.toBeCalled()
  })

  it('should throw error when end time is not iso date string', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: 1,
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'endTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  it('should throw error when start time is undefined', async () => {
    const ctx = {
      request: {
        body: {
          endTime: '2020-10-10T00:00:00.000Z',
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  it('should throw error when end time is undefined', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'endTime must be a ISO date string',
    })

    expect(next).not.toBeCalled()
  })

  it('should throw error when start time greater than end time', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-11-11T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'startTime must be less than endTime',
    })

    expect(next).not.toBeCalled()
  })

  it('should throw error when staffs is not a list', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
          staffs: 'string',
        },
      },
    }
    
    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'staffs must be a list of string',
    })

    expect(next).not.toBeCalled()
  })

  it('should throw error when area codes is not a list', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
          staffs: ['5f7c4dfd948c8900245ea8a5'],
          areaCodes: 'string',
        },
      },
    }

    await expect(findMonitorListTasksValidator(ctx, next)).rejects.toEqual({
      statusCode: 400,
      messageCode: 'error.SN-009',
      error: 'areaCodes must be a list of string',
    })

    expect(next).not.toBeCalled()
  })

  it('should not throw error when request body are valid', async () => {
    const ctx = {
      request: {
        body: {
          startTime: '2020-10-10T00:00:00.000Z',
          endTime: '2020-11-10T00:00:00.000Z',
          staffs: ['5f7c4dfd948c8900245ea8a5'],
          areaCodes: ['103202040903'],
        },
      },
    }

    await findMonitorListTasksValidator(ctx, next)

    expect(next).toBeCalled()
  })
})
