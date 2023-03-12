const moment = require("moment");
const prompt = require("prompt-sync");
const MongoClient = require('mongodb').MongoClient;

const importStaffAndTeam = require("./migrateAssurance_v6_insert_staff_team");
const updateRelationTeam = require("./migrateAssurance_v6_update_team");
const addRole = require("./migrateAssurance_v6_addRole");
const backupData = require("./migrateAssurance_v6_backup");
const deleteImportData = require("./migrateAssurance_v6_delete.js");
const updateStaffCodeWithR = require("./migrateAssurance_v6_update_staff_code_with_r");

(async () => {
  const config = {
    project: {
      assurance: {
        id: '5cf0ad79b603c7605955bc7f',
        name: 'assurance'
      }
    },
    mongoDB: {
      prodURI: "mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin",
      stagingURI: "mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin",
      ptURI: "mongodb+srv://devsupport2:BjsH43eLzSP5djwT@drivs-loadtest.21cur.mongodb.net/?authSource=admin"
    }
  }
  
  const selectedConfig = {
    importedFlag: `assurance-test-load-team-${moment().format('YYYY-MM-DD')}`,
    project: config.project.assurance,
    mongoDBUri: config.mongoDB.ptURI
  }
  
  console.log(selectedConfig, '\n')
  prompt()('Do you want to migrate with this config ?');
  
  const mongoClient = new MongoClient(
    selectedConfig.mongoDBUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
  await mongoClient.connect();
  
  const roles = [
    {
      id: "5f0ff6fee22b240011e52504",
      name: "TEAM_LEADER",
    },
    // {
    //   id: "5f0ff495e22b240011e52503",
    //   name: "ZONE_MONITOR_ROUTER",
    // }
  ]
  
  // const importAlls = ['Outsource','RNSO-BMA', 'RNSO-UPC1', 'RNSO-UPC2']

  try {
    // await backupData(selectedConfig)
    
    // test import all data
    // for (const importAll of importAlls) {
    //   await importStaffAndTeam(mongoClient, selectedConfig, importAll)
    // }
    
    
    // await updateRelationTeam(mongoClient, selectedConfig)
    // await addRole(mongoClient, selectedConfig, roles)
    
    await deleteImportData(mongoClient)
    // mongorestore --uri="mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/" --nsInclude=4pl-user-management.users backup/assurance-BMA-2021-01-25T18:16
    
    // special
    // await updateStaffCodeWithR(mongoClient, selectedConfig)
  } catch (err) {
    throw err
  }
})()