import * as R from 'ramda'
import { isRequiredField } from '../utils/domain'

const validate = {
  projectId: true,
  companyId: true,
}
export default () => async (ctx, next) => {
  const { header } = ctx.request
  const { body } = ctx.request
  body.projectId = R.path(['projectId'], body) || header['project-id'] // || '5cf0ad79b603c7605955bc7f'
  body.companyId = R.path(['companyId'], body) || header['company-id'] // || '5cee7a9bfc47036f05b13847'
  isRequiredField(body, validate)
  await next()
}
