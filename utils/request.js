export const jsonTryParse = (jString, defaultValue = {}) => {
  try {
    return JSON.parse(jString)
  } catch (error) {
    return defaultValue
  }
}

export const parseMongooseOptions = ({ limit, page, ...options }) => ({
  limit: limit ? +limit : 20,
  page: page ? +page : 1,
  ...options,
})
