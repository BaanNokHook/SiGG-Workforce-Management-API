import { Client } from '@elastic/elasticsearch'
import config from '../../config'

export const ESClient = (function () {
  let instance

  function createInstance() {
    const client = new Client({
      node: config.elasticSearch.nodeHost,
    })
    return client
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    },
  }
})()
