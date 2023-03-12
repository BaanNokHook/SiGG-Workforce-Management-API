// @flow
import axios from 'axios'
import R from 'ramda'

export interface ILogger {
  info(error: Error, ...params: any[]): void;
  info(obj: Object, ...params: any[]): void;
}

export interface IConfig {
  baseURL: string;
  headers: any;
}

export type Params = { [key: string]: string | number | boolean }

export interface IRequest {
  url?: string;
  method?: axios.Method;
  headers?: any;
  params?: Params;
  data?: any;
}

function getErrorMessage(data: any) {
  const message01 = R.path(['error'], data)
  if (message01) return JSON.stringify(message01)

  const message02 = R.path(['title'], data)
  if (message02) return JSON.stringify(data)

  return undefined
}

export class ResponseError extends Error {
  status: string
  statusText: string
  data: any
  headers: any
  request: axios.AxiosRequestConfig

  constructor(
    request: axios.AxiosRequestConfig,
    status: string,
    statusText: string,
    headers: any,
    data: any,
  ) {
    const errorMessage = getErrorMessage(data) || `${status} ${statusText}`
    super(errorMessage)
    this.status = status
    this.statusText = statusText
    this.headers = headers
    this.data = data
    this.request = request
  }
}

export class RequestError extends Error {
  message: string
  request: axios.AxiosRequestConfig

  constructor(request: axios.AxiosRequestConfig, message: string) {
    super(message)
    this.message = message
  }
}

function handleError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, statusText, headers, data } = error.response
    return Promise.reject(new ResponseError(error.config, status, statusText, headers, data))
  }

  if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    const { message } = error.request
    return Promise.reject(new RequestError(error.config, message))
  }

  return Promise.reject(error)
}

export interface IRestClient {
  request<T>(request: IRequest): Promise<T>;
  get<T>(url: string, request?: IRequest): Promise<T>;
  put<T>(url: string, request?: IRequest): Promise<T>;
  post<T>(url: string, request: IRequest): Promise<T>;
  delete<T>(url: string, request: IRequest): Promise<T>;
}

export class RestClient implements IRestClient {
  axios: axios.AxiosInstance

  constructor(config: IConfig) {
    this.axios = axios.create(config)
  }

  request<T>(request: IRequest): Promise<T> {
    const config: axios.AxiosRequestConfig = {
      ...request,
      timeout: 30000,
    }

    return this.axios
      .request(config)
      .then((response) => response.data)
      .catch((error) => handleError(error))
  }

  get<T>(url: string, request?: IRequest | Object = {}): Promise<T> {
    return this.request({
      method: 'GET',
      url,
      ...request,
    })
  }

  put<T>(url: string, request: IRequest | Object = {}): Promise<T> {
    return this.request({
      method: 'PUT',
      url,
      ...request,
    })
  }

  post<T>(url: string, request: IRequest | Object = {}): Promise<T> {
    return this.request({
      method: 'POST',
      url,
      ...request,
    })
  }

  delete<T>(url: string, request: IRequest | Object = {}): Promise<T> {
    return this.request({
      method: 'DELETE',
      url,
      ...request,
    })
  }
}
