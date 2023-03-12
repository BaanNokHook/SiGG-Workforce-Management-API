import osrmHttpService from '../../services/httpService/osrm'

export interface IOsrmGatewayDomain {
  distanceMatrix(coordinates: number[], sources: number[], destinations: number[][]): number[][];
}

export class OsrmGatewayDomain {
  async distanceMatrix(coordinates: number[], sources: number[], destinations: number[][]) {
    const toQueryString = (acc, curr, i) => {
      if (i === 0) return `${curr[0]},${curr[1]}`
      return `${acc}|${curr[0]},${curr[1]}`
    }

    const coordinateQuery = coordinates.reduce(toQueryString, '')
    const sourcesQuery = sources.join('|')
    const destinationsQuery = destinations.join('|')

    const distanceMatrix = await osrmHttpService.getMany({
      thing: 'osrm/distance-matrix/car',
      queryString: `coordinates=${coordinateQuery}&sources=${sourcesQuery}&destinations=${destinationsQuery}`,
    })

    return distanceMatrix.data.durations
  }
}

export const osrmGatewayDomain = new OsrmGatewayDomain()
