export default {
  MONGOOSE_OBJECT_ID_INVALID: (err: any) => {
    const field = err.message.substring(
      err.message.lastIndexOf('at path "') + 9,
      err.message.lastIndexOf('" for model'),
    )
    const model = err.message.substring(
      err.message.lastIndexOf('for model "') + 11,
      err.message.length - 1,
    )
    const value = err.message.substring(
      err.message.lastIndexOf('for value "') + 11,
      err.message.lastIndexOf('" at path'),
    )
    const resp = {
      statusCode: 400,
      messageCode: 'error.DB-001',
      message: 'Invalid ObjectId',
      error: {
        [field]: `value ${value} is invalid type of mongoose ObjectId for Model ${model}`,
      },
    }

    return resp
  },
}
