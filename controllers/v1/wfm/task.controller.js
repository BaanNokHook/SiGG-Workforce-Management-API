import { HttpMethod, route } from '@spksoft/koa-decorator'
import withProjectAndCompany from '../../../middlewares/withProjectAndCompany'
import { WfmTasksSearch } from '../../../domains/wfm/task/search'
import { SyncTaskData } from '../../../domains/wfm/task/syncTaskData'
import { TaskMonitorListEsClient } from '../../../services/elasticsearch/taskMonitorListEsClient'

@route('/v1/wfm/tasks')
class WfmTask {
  @route('/search', HttpMethod.POST, withProjectAndCompany())
  async wfmTasksSearch(ctx) {
    const { body } = ctx.request
    const { limit, page, selectedFields, ...bodyRequest } = body
    const options = { limit, page, selectedFields }
    const wfmTasksSearch = new WfmTasksSearch(new TaskMonitorListEsClient())
    const resp = await wfmTasksSearch.search({ bodyRequest, options })
    ctx.res.ok({ data: resp })
  }

  @route('/sync-data/batch', HttpMethod.POST, withProjectAndCompany())
  async syncData(ctx) {
    const { body } = ctx.request
    const { startTime, offSetTime, companyId, projectId } = body
    const syncTaskData = new SyncTaskData(new TaskMonitorListEsClient())
    const resp = await syncTaskData.batchProcessReIndexing({
      startTime,
      offSetTime,
      companyId,
      projectId,
    })
    ctx.res.ok({ data: resp })
  }
}

export default WfmTask
