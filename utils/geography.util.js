import R from 'ramda'
import GeographyRepository from '../models/geography.repository'
import { findOneWithOutThrow, findAndUpdateOrCreate } from './domain'
import addressHttpService from '../services/httpService/address'
import { VEHICLE_TYPE } from '../constants/geography'

type GetDistanceByGeographyIds = {
  geographyIds: Array,
  geographyType: string,
  engine: string,
  vechicleType: string,
}

const MOTORCYCLE_WITH = ['TOLL']
const TAXI_WITH = ['TOLL', 'MOTORWAY']
const CAR_WITH = ['TOLL', 'MOTORWAY']
export const AVOIDS = ['TOLL', 'MOTORWAY', 'FERRY', 'TUNNEL', 'DIRT', 'PARK']

const handleAvoids = {
  car: R.without(CAR_WITH, AVOIDS),
  taxi: R.without(TAXI_WITH, AVOIDS),
  motorcycle: R.without(MOTORCYCLE_WITH, AVOIDS),
}

export const createGeography = async geographyId => {
  const newGeography = await findAndUpdateOrCreate(
    GeographyRepository,
    { referenceGeographyId: geographyId._id },
    { ...geographyId, referenceGeographyId: geographyId._id },
  )
  return newGeography
}

export const getGeographyType = async filter => {
  const getRespAddress = await addressHttpService.getMany({
    thing: 'geographytypes',
    queryString: filter,
    headers: null,
  })
  return R.path(['data', 'data', 'data'], getRespAddress)
}

export const getGeographyRepositroy = async filter => {
  const resp = await findOneWithOutThrow(GeographyRepository, filter)
  return resp
}

export const getGeographyAddressService = async filter => {
  const resp = await addressHttpService.getMany({
    thing: 'geographies',
    queryString: filter,
    headers: null,
  })

  /** If search from 4pl-addess /geographies?search
   * Not found return null
   */
  const respData = R.path(['data', 'data', 'data'], resp)
  return respData.length ? respData : []
}

export const getGeocodingAddressService = async (geography, engine = 'GOOGLE') => {
  const { geographyType, param } = geography
  const resp = await addressHttpService.getMany({
    thing: 'geocoding',
    queryString: `engine=${engine}&address=${param}&geographyType=${geographyType}`,
    headers: null,
  })

  return R.path(['data', 'data'], resp)
}

/** getGeographyFlow -> find tms db -> find geography 4pl-address -> find geoconding 4pl-address -> [stamp db] */
export const getGeographyFlow = async ({ data, geoTypes }) => {
  try {
    const addressesWithGeography = data.map(address => ({
      ...address,
      param: encodeURIComponent(address.address),
      // sessiontoken: '5bb6f750e7fc303beb9eb0b1',
      geographyType: geoTypes[address.extensionType]._id,
    }))

    const totalAddress = addressesWithGeography.length

    /** Find geography address from Gepgraphy Repository from TMS db */
    const addressesFromRepository = await Promise.all(
      addressesWithGeography.map(async val => {
        const geography = await getGeographyRepositroy({ 'address.address': val.address })
        if (!geography) {
          return null
        }
        return geography
      }),
    )

    const addressesFilterTrue = addressesFromRepository.filter(address => !!address)
    /** Return address and groupBy task that match orders
     *  !NOt Stamp data
     */
    if (totalAddress === addressesFilterTrue.length) {
      const newTasks = addressesFromRepository.map((val, index) => ({
        geographyId: addressesFromRepository[index],
      }))
      return newTasks
    }

    const addressesMatchWithRepository = R.clone(addressesWithGeography).map((val, index) => {
      const addressTemp = val
      addressTemp.geographyId = addressesFromRepository[index] || null
      return val
    })

    const keySearch = addressesMatchWithRepository
      .filter(val => !val.geographyId)
      .map(address => address.param)

    const searchFilter = `search=${JSON.stringify({
      'address.address': {
        $in: keySearch,
      },
    })}`

    /** Request geography service from 4pl-address-zoning
     *  TODO : search /geography?search from 4pl-address
     */

    const respSearchGeography = await getGeographyAddressService(searchFilter)
    const geoGraphyMatch = R.map(R.path(['address', 'address']), respSearchGeography)
    const addressesMatchWithGeographyService = addressesMatchWithRepository.map(val => {
      const newVal = val
      if (geoGraphyMatch.includes(newVal.address)) {
        const findIndex = respSearchGeography.findIndex(
          geography => geography.address.address === newVal.address,
        )
        newVal.geographyId = respSearchGeography[findIndex] || null
        return newVal
      }
      return newVal
    })

    /** Return address and 4pl-address /geographies */
    const totalAddressesGeographyService = addressesMatchWithGeographyService.filter(
      addressMatch => addressMatch.geographyId,
    ).length

    if (totalAddress === totalAddressesGeographyService) {
      const addressesUpsertRepository = await Promise.all(
        addressesMatchWithGeographyService.map(async ({ geographyId }) => {
          const newGeographyId = await createGeography(geographyId)
          return newGeographyId
        }),
      )

      const newTasks = addressesUpsertRepository.map(val => ({
        geographyId: val,
      }))
      return newTasks
    }

    const addressesMatchWithGeocodingService = await addressesMatchWithGeographyService.reduce(
      async (acc, address) => {
        const asynAcc = await acc
        const newAddress = {
          ...address,
          geographyId: await getGeocodingAddressService(address),
        }
        return [...asynAcc, newAddress]
      },
      Promise.resolve([]),
    )

    /** The last update on TMS repository
     * Return Address from 4pl-address service /geoconding
     */
    const addressesUpsertRepository = await Promise.all(
      addressesMatchWithGeocodingService.map(async ({ geographyId }) => {
        const newGeographyId = await createGeography(geographyId)
        return newGeographyId
      }),
    )

    const newTasks = addressesUpsertRepository.map(val => ({ geographyId: val }))
    return newTasks
  } catch (error) {
    console.error('[Error getGeographyFlow] :: ', JSON.stringify(error))
    throw { error: JSON.stringify(error), condition: 'GET_GEOGRAPHY_FLOW FUNCTION' }
  }
}

export const groupWayPoints = R.compose(
  R.map(async v => {
    const location = await v
    return {
      latitude: R.pathOr(0, ['feature', 'geometry', 'coordinates', '1'], location),
      longitude: R.pathOr(0, ['feature', 'geometry', 'coordinates', '0'], location),
    }
  }),
  R.map(async id => {
    const getGeography = await findOneWithOutThrow(GeographyRepository, { _id: id })
    if (R.type(getGeography.toObject()) === 'Function') {
      return getGeography.toObject()
    }
    return getGeography
  }),
)

const setFilterGeoType = extensionType => () =>
  `search=${JSON.stringify({
    code: extensionType,
  })}`

export const getDirectionService = async (
  wayPoints: Array,
  avoids: Array,
  geographyType: string,
  engine = 'HERE',
  vehicleType = 'CAR',
) => {
  const _wayPoints = JSON.stringify(wayPoints)
  const _avoids = avoids
  const geoTypes = R.indexBy(
    R.prop('name'),
    await getGeographyType(setFilterGeoType(geographyType)),
  )
  let queryString = `engine=${engine}&wayPoints=${_wayPoints}&avoids=${_avoids}&geographyType=${geoTypes[geographyType]._id}`
  if (vehicleType === VEHICLE_TYPE.MOTORCYCLE) {
    queryString += `&mode=${R.toLower(VEHICLE_TYPE.MOTORCYCLE)}`
  }
  const getRespDirection = await addressHttpService.getMany({
    thing: 'direction',
    queryString,
    headers: null,
  })

  const directions = R.path(['data', 'data'], getRespDirection)

  const newGeographyId = directions && (await createGeography(directions))
  return newGeographyId
}

export const getDistanceByWayPoints = async (
  wayPoints: Array,
  geographyType: string,
  engine = `HERE`,
  vechicleType: string = 'car',
) => {
  const geographyDirectionId = await getDirectionService(
    wayPoints,
    handleAvoids[vechicleType],
    geographyType,
    engine,
  )
  return geographyDirectionId
}

export const getDistanceByGeographyIds = async ({
  geographyIds,
  geographyType,
  engine = `HERE`,
  vehicleType = 'CAR',
}: GetDistanceByGeographyIds) => {
  const getUniqGeography = R.uniq(R.pluck(['_id'], geographyIds))
  const mappingGeographyDuplicate = R.indexBy(R.prop('_id'), geographyIds)
  const geographyIdsWithoutDuplicate = getUniqGeography.map(
    geographyId => mappingGeographyDuplicate[geographyId],
  )
  const getWayPoints = await Promise.all(await groupWayPoints(geographyIdsWithoutDuplicate))
  const geographyDirectionId = await getDirectionService(
    getWayPoints,
    handleAvoids[vehicleType],
    geographyType,
    engine,
    vehicleType
  )
  return geographyDirectionId
}
