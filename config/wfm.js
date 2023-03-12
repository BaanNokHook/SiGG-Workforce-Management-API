export default {
  PROJECT_ID: {
    ASSURANCE: process.env.WFM_PROJECT_ID,
    INSTALLATION: process.env.WFM_PROJECT_INSTALL_ID,
  },
  COMPANY_ID: process.env.WFM_COMPANY_ID,
  WFM_API_TS_URL: process.env.WFM_API_TS_URL,
  taskMonitorList: {
    elasticIndex: '4pl-tms-worker.4pl-tms.task-monitor-list',
    consumerGroupId:
      process.env.TASK_MONITOR_CONSUMER_GROUP_ID ||
      '4pl-tms-api.wfm.task-monitor-list-elasticsearch.1',
  },
}
