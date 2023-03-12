export default {
  ALREADY_EXIST_MAPPING: error => ({
    statusCode: 400,
    messageCode: 'error.SN-002',
    message: 'Task type mapping already exist',
    error,
  }),
}
