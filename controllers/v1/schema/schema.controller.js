import { HttpMethod, route } from '@spksoft/koa-decorator'
import R from 'ramda'
import { schemaDefinition as customerSchema } from '../../../models/customer.repository'
import { schemaDefinition as rejectSchema } from '../../../models/reject.repository'
import { schemaDefinition as staffSchema } from '../../../models/staff.repository'
import { schemaDefinition as taskSchema } from '../../../models/task.repository'
import { schemaDefinition as todoSchema } from '../../../models/todo.repository'
import { schemaDefinition as todoTypeSchema } from '../../../models/todoType.repository'
import { schemaDefinition as tripSchema } from '../../../models/trip.repository'
import { schemaDefinition as parcelSchema } from '../../../models/parcel.repository'
import { schemaDefinition as geographySchema } from '../../../models/geography.repository'
import { schemaDefinition as extensionFlowSchema } from '../../../models/extensionFlow.repository'
import { schemaDefinition as taskTypeSchema } from '../../../models/taskType.repository'
import { schemaDefinition as taskTypeGroupSchema } from '../../../models/taskTypeGroup.repository'

export const typeObjectConvert = schema => {
  const listKey = R.keys(schema)
  const result = R.reduce(
    (acc, value) => {
      //
      acc[value] = typeConvert(schema[value])
      return acc
    },
    {},
    listKey,
  )

  return result
}

export const typeConvert = (value, tagCount = false) => {
  if (R.type(value) === 'Array') {
    return [typeConvert(value[0], true)]
  }
  if (R.path(['name'], value) === 'Date' || R.path(['type', 'name'], value) === 'Date') {
    return ''
  }
  if (R.path(['name'], value) === 'String' || R.path(['type', 'name'], value) === 'String') {
    return ''
  }
  if (R.path(['name'], value) === 'Number' || R.path(['type', 'name'], value) === 'Number') {
    return 0
  }
  if (R.path(['name'], value) === 'ObjectId' || R.path(['type', 'name'], value) === 'ObjectId') {
    if (tagCount) {
      /* Case populate objectId nested array  */
      return {}
    }
    return ''
  }
  if (R.path(['name'], value) === 'Boolean' || R.path(['type', 'name'], value) === 'Boolean') {
    return true
  }
  if (R.type(value) === 'Object') {
    if (typeof value.type === 'function') {
      return {}
    }
    return typeObjectConvert(value)
  }
  return null
}

export const convertSchemaForGraph = schema => ({
  ...typeConvert(schema),
  updatedAt: '',
  createdAt: '',
  deletedAt: '',
  _id: '',
})

@route('/v1/schema')
class SchemaGraphQL {
  @route('/customer', HttpMethod.GET)
  async customerSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(customerSchema) })
  }

  @route('/extensionflow', HttpMethod.GET)
  async extensionFlowSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(extensionFlowSchema) })
  }

  @route('/parcel', HttpMethod.GET)
  async parcelSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(parcelSchema) })
  }

  @route('/reject', HttpMethod.GET)
  async rejectSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(rejectSchema) })
  }

  @route('/staff', HttpMethod.GET)
  async staffSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(staffSchema) })
  }

  @route('/task', HttpMethod.GET)
  async taskSchema(ctx) {
    ctx.res.ok({
      data: {
        ...convertSchemaForGraph(taskSchema),
        appointmentTime: '',
        deadline: '',
        information: {},
      },
    })
  }

  @route('/todo', HttpMethod.GET)
  async todoSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(todoSchema) })
  }

  @route('/todoType', HttpMethod.GET)
  async todoTypeSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(todoTypeSchema) })
  }

  @route('/trip', HttpMethod.GET)
  async tripSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(tripSchema) })
  }

  @route('/geography', HttpMethod.GET)
  async geographySchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(geographySchema) })
  }

  @route('/taskType', HttpMethod.GET)
  async taskTypeSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(taskTypeSchema) })
  }

  @route('/taskTypeGroup', HttpMethod.GET)
  async taskTypeGroupSchema(ctx) {
    ctx.res.ok({ data: convertSchemaForGraph(taskTypeGroupSchema) })
  }
}

export default SchemaGraphQL
