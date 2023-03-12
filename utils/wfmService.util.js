import config from '../config'

const { wfm } = config
const { WFM_API_TS_URL } = wfm

export const getPathUpdateRescheduleStaffWFM = () => {
  return WFM_API_TS_URL
}
