// @flow
import R from 'ramda'
import moment from 'moment'
import fileServiceHttp from '../../services/httpService/fileUpload'

export type Config = {
  fromPath: Array<string>,
  toPath: Array<string>,
}

type StateResult = {
  result: any,
}

/**
 *
 * @param url[] =  ["http://example.com/file-service/image1.jpg", "http://example.com/file-service/image1.jpg"]
 * Process :  [["http:", "", "example.com", "file-service", "image1.jpg"], ["http:", "", "example.com", "file-service", "image2.jpg"]]
 * Output  : [  "image1.jpg" , "image2.jpg" ]
 */

const splitUrlResult = (url: Array<string> | string) => {
  return R.type(url) === 'Array'
    ? url.map(urlItem => R.last(urlItem.split('/')))
    : R.last(url.split('/'))
}

const updateExpireDate = async (fileId: string, expireDate: string): void => {
  await fileServiceHttp.put({
    thing: `v2/upload`,
    id: `${fileId}`,
    body: { expireDate },
    headers: null,
  })
}

const isResultHasDataOrNull = (state: StateResult, fromPath: string[]): Boolean =>
  state.result && Object.keys(state.result).length > 0 && R.pathOr(false, fromPath, state)

export default async (config: Config, nextResult: StateResult, prevResult: any) => {
  let filterAbandon = null
  const { fromPath } = config

  const getNextResultOrNull = isResultHasDataOrNull(nextResult, fromPath)
    ? splitUrlResult(R.path(fromPath, nextResult))
    : null

  const getPrevResultOrNull = isResultHasDataOrNull(prevResult, fromPath)
    ? splitUrlResult(R.path(fromPath, prevResult))
    : null

  if (!prevResult.result) return getNextResultOrNull

  const UPDATE_EXPIRE_DATE_REMOVE =
    moment()
      .add(1, 'd')
      .unix() * 1000 // 1 day expireDate

  if (R.type(getPrevResultOrNull) === 'Array') {
    filterAbandon =
      getNextResultOrNull && getPrevResultOrNull.filter(item => !getNextResultOrNull.includes(item))

    if (!R.isEmpty(filterAbandon) && !R.isNil(filterAbandon)) {
      await Promise.all(
        filterAbandon.map(async fileId => {
          const respUpdate = await updateExpireDate(fileId, UPDATE_EXPIRE_DATE_REMOVE)
          return respUpdate
        }),
      )
    }

    if (!getNextResultOrNull) {
      await Promise.all(
        getPrevResultOrNull.map(async fileId => {
          const respUpdate = await updateExpireDate(fileId, UPDATE_EXPIRE_DATE_REMOVE)
          return respUpdate
        }),
      )
    }
  }

  if (R.type(getPrevResultOrNull) === 'String' && getPrevResultOrNull !== '') {
    filterAbandon = getNextResultOrNull !== getPrevResultOrNull && getPrevResultOrNull
    if (filterAbandon) {
      await updateExpireDate(filterAbandon, UPDATE_EXPIRE_DATE_REMOVE)
    }
  }

  return getNextResultOrNull
}
