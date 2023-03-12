export default {
  NOT_FOUND: error => ({
    statusCode: 404,
    messageCode: 'error.SN-001',
    error,
  }),
  ALREADY_EXIST: error => ({
    statusCode: 400,
    messageCode: 'error.SN-002',
    message: 'Already exist',
    error,
  }),
  FIELD_IS_REQUIRED: error => ({
    statusCode: 400,
    messageCode: 'error.SN-003',
    error,
  }),
  CANCEL_TRIP_FAILED: error => ({
    statusCode: 400,
    messageCode: 'error.SN-004',
    error,
  }),
  UPDATE_TODO_FAILED: error => ({
    statusCode: 400,
    messageCode: 'error.SN-005',
    error,
  }),
  BULK_WRITE_FAILED: error => ({
    statusCode: 500,
    messageCode: 'error.SN-006',
    error,
  }),
  UPDATE_DISTANCE_DEFAULT_LOCATION: error => ({
    statusCode: 500,
    messageCode: 'error.SN-007',
    error,
  }),
  ADD_TASK_TO_TRIP_FAILED: error => ({
    statusCode: 400,
    messageCode: 'error.SN-008',
    error,
  }),
  FIELD_IS_INVALID: error => ({
    statusCode: 400,
    messageCode: 'error.SN-009',
    error,
  }),
}
