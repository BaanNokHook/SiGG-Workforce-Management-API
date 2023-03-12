import R from 'ramda'
import mongoose from 'mongoose'
import rejectRepository from '../../models/reject.repository'
import extensionFlowRepository from '../../models/extensionFlow.repository'
import ThrowError from '../../error/basic'

const ObjectId = R.path(['Types', 'ObjectId'], mongoose)

type RejectCreate = {
  remark: string,
  staffId: string,
  referenceId: string,
  referenceType: string,
  reqeustDate: string,
  projectId: string,
  companyId: string,
  referenceProjectId: string,
  referenceCompanyId: string,
}

export default async (data: RejectCreate) => {
  console.log('TCL: [RejectCreate]', data)
  try {
    let remarkFinal = null
    if (R.path(['extensionFlow'], data)) {
      const orderReturn = R.path(['extensionFlow', 'orderReturn'], data)
      if (data.remark) {
        remarkFinal = orderReturn.find(remarkReturn => remarkReturn === data.remark)
      } else {
        remarkFinal = orderReturn.find(remarkReturn => remarkReturn.default === true)
      }
    }

    console.log('remarkFinal :: ', remarkFinal)
    // const groupRemarkByExtensionFlow = await extensionFlowRepository.aggregate([
    //   { $match: { 'orderReturn._id': ObjectId(`${data.remark}`) } },
    //   {
    //     $project: {
    //       'orderReject._id': 1,
    //       'orderReject.title': 1,
    //       'orderReturn._id': 1,
    //       'orderReturn.title': 1,
    //     },
    //   },
    // ])

    // console.log('R.head(groupRemarkByExtensionFlow) :: ', groupRemarkByExtensionFlow)
    // const { orderReturn = [], orderReject = [] } = R.head(groupRemarkByExtensionFlow)
    // const respOrderReturn = orderReturn.find(val => val._id == data.remark)
    // console.log('TCL: respOrderReturn', respOrderReturn)
    // const respOrderReject = orderReject.find(val => val._id == data.remark)
    // console.log('TCL: respOrderReject', respOrderReject)

    const newReject = await rejectRepository.create({
      ...data,
      note: R.pathOr('', ['title', 'th'], remarkFinal),
      refs: {
        ...(remarkFinal && { ...remarkFinal }),
        // ...(respOrderReject && { ...respOrderReject }),
      },
    })

    return newReject
  } catch (error) {
    console.log('[ERROR] newReject ', error)
    throw error
  }
}
