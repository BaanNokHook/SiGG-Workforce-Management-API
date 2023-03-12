// @flow
import axios from 'axios'

export const HttpMethodConstant = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
}

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

type BaseHttpMethodGet = {
  thing: string,
  findBy: string,
  headers: any,
}

type BaseHttpMethodGetMany = {
  thing: string,
  queryString: string,
  headers: any,
}

type BaseHttpMethodGetDistinct = {
  thing: string,
  key: string,
  headers: any,
}

type BaseHttpMethodPost = {
  thing: string,
  body: any,
  headers: any,
}

type BaseHttpMethodPut = {
  thing: string,
  id: string,
  body: any,
  headers: any,
}

type BaseHttpMethodRemove = {
  thing: string,
  id: string,
  headers: any,
}

type BaseHttpMethodDeleteOne = {
  thing: string,
}

export type BaseHttpMethodRequest = {
  method: HttpMethod,
  url: string,
  data?: any,
  params?: any,
  headers?: Headers,
}

export default (baseUrl: string) => {
  const get = async ({ thing, findBy, headers }: BaseHttpMethodGet) => {
    const result = await axios.get(`${baseUrl}/${thing}/${findBy}`, {
      headers,
    })
    return result
  }

  const getMany = async ({ thing, queryString, headers }: BaseHttpMethodGetMany) => {
    const result = await axios.get(`${baseUrl}/${thing}?${queryString}`, { headers })
    return result
  }

  const getDistinct = async ({ thing, key, headers }: BaseHttpMethodGetDistinct) => {
    const result = await axios(`${baseUrl}/${thing}/distinct/${key}`, { headers })
    return result
  }

  const post = async ({ thing, body, headers }: BaseHttpMethodPost) => {
    const result = await axios.post(`${baseUrl}/${thing}`, body, { headers })
    return result
  }

  const put = async ({ thing, id, body, headers }: BaseHttpMethodPut) => {
    const result = await axios.put(`${baseUrl}/${thing}/${id}`, body, { headers })
    return result
  }

  const remove = async ({ thing, id, headers }: BaseHttpMethodRemove) => {
    const result = await axios.delete(`${baseUrl}/${thing}/${id}`, { headers })
    return result
  }

  const deleteOne = async ({ thing }: BaseHttpMethodDeleteOne) => {
    const result = await axios.delete(`${baseUrl}/${thing}`)
    return result
  }

  const request = ({ method, url, data, headers, params }: BaseHttpMethodRequest): Promise<any> => {
    const req = axios({
      method,
      url: `${baseUrl}/${url}`,
      data,
      headers,
      params,
    })
    return req
  }

  return { get, put, post, remove, getMany, getDistinct, deleteOne, request }
}
