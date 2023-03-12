import { validateData } from './validate'

describe('validateData', () => {
  it('Should validate pass and return value true', () => {
    /**
     * a number between -90 and 90
     * and the longitude between -180 and 180
     */
    const data = {
      latitude: -90.0,
      longitude: 100.0,
      c: false,
      d: ['d'],
    }
    const result = validateData({
      schema: {
        properties: {
          latitude: {
            maximum: 90,
            errorMessage: 'must be an Integer between -90 - 90',
            pattern: '^([-+]?)([d]{1,2})(((.)(d+)))$',
          },
          longitude: {
            maximum: 180,
            errorMessage: 'must be an Integer between -180 - 180',
            pattern: '^(s*)(([-+]?)([d]{1,3})((.)(d+))?)$',
          },
          c: { type: 'boolean' },
          d: {
            type: 'array',
            contains: { type: 'string', pattern: '^(?!s*$).+' },
            errorMessage: 'contains must be an String',
          },
        },
        required: ['latitude', 'longitude', 'c', 'd'],
      },
      data,
    })

    expect(result).toBeTruthy()
  })

  it(`Invalid input value, should throw Error`, () => {
    const invalidData = {
      latitude: 'string_a',
      longitude: '1',
      c: '2',
      d: [null],
    }

    function invalidateData() {
      validateData({
        schema: {
          properties: {
            latitude: {
              maximum: 90,
              errorMessage: 'must be an Integer between -90 - 90',
              pattern: '^([-+]?)([d]{1,2})(((.)(d+)))$',
            },
            longitude: {
              maximum: 180,
              errorMessage: 'must be an Integer between -180 - 180',
              pattern: '^(s*)(([-+]?)([d]{1,3})((.)(d+))?)$',
            },
            c: { type: 'boolean' },
            d: {
              type: 'array',
              contains: { type: 'string', pattern: '^(?!s*$).+' },
              errorMessage: 'must be an String',
            },
          },
          required: ['latitude', 'longitude', 'c', 'd'],
        },
        data: invalidData,
      })
    }

    expect(invalidateData).toThrow()
  })
})
