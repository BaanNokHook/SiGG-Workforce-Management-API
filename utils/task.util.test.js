import { getRefOrderIds } from './task.util'

describe('Task util', () => {
  it('getRefOrderIds should return refOrderIds', () => {
    const task = {
      information: {
        parcels: [{ refOrderId: 'ODM2009140816307' }, { refOrderId: 'ODM2009140816307' }],
      },
    }
    const result = getRefOrderIds(task)
    expect(result).toEqual(['ODM2009140816307'])
  })

  it('getRefOrderIds should return null', () => {
    const task = {
      information: {
        parcels: [{ name: 'ไก่ CP 500g' }, { name: 'ไก่ CP 1kg' }],
      },
    }
    const result = getRefOrderIds(task)
    expect(result).toBeNull()
  })
})
