import config from '../config'

const { kong } = config
const { baseUrl } = kong

export const getFileServiceUrl = (pathFile: string) => {
  if (!pathFile) {
    return undefined
  }
  const fileServiceUrl = `${baseUrl}/v2/file-service/static`
  return fileServiceUrl + pathFile
}

export const getPathFileFromUrl = (url: string) => {
  if (!url) {
    return undefined
  }
  const filePath = url.replace(/([^]+static)/g, '')
  return filePath
}

export const getFileIdFromUrl = (url: string) => {
  const matches = url.match(/static\/([^.]*)/)

  if (matches && matches.length > 1) {
    return matches[1]
  }
}

export const getFilename = (url: string): string => {
  return url.substring(url.lastIndexOf('/') + 1)
}
