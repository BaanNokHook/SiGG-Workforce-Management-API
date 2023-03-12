import R from 'ramda'
import parcelExtension from './parcel'
import qrunExtension from './qrun'
import taxiExtension from './taxi'

const EXTENSION_FLOW = { QRUN: qrunExtension, PARCEL: parcelExtension, TAXI: taxiExtension }

export default async body => {
  const extensionType = R.path(['extensionType'], body)
  const resp = await EXTENSION_FLOW[extensionType](body)
  return resp

}
