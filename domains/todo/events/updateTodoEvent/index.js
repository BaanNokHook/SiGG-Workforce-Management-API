import R from 'ramda'
import UpdateTodoCFM from './handler/updateTodoCFM'
import UpdateTodoWFMAPI from './handler/updateTodoWFMAPI'
import cfmService from '../../../../services/cfm'
import fleetService from '../../../../services/httpService/fleet'
import { TaskCreator } from './handler/type'
import wfmApiTsService from '../../../../services/httpService/wfm'

const WFM_PROJECT = '5cf0ad79b603c7605955bc7f'

export default async (props) => {
  const projectId = R.path(['todo', 'todoType', 'projectId'], props)
  const task = R.path(['todo', 'taskId'], props)

  const isWFMProject = projectId.toString() === WFM_PROJECT
  if (isWFMProject) {
    const createUser = R.path(['information', 'metaInformation', 'baseInformation', 'createUser'], task) 
    if (createUser === TaskCreator.TRUE_CFM) {
      const updateTodoCfm = new UpdateTodoCFM(cfmService, fleetService)
      await updateTodoCfm.update(props)
    }else if(createUser === TaskCreator.SCCD){
      const updateTodoWFMAPI = new UpdateTodoWFMAPI(wfmApiTsService)
      await updateTodoWFMAPI.updateTodoToWfmAPI(props)
    }
  }

}
