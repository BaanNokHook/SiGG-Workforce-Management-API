const ObjectId = require('mongodb').ObjectID;
const prompt = require("prompt-sync");

const deleteImportData = async (mongoClient) => {
  const deleteFlag = "assurance-test-load-team-2021-02-01"
  
  console.time(deleteFlag)
  
  
  prompt()(`Do you want to delete with flag ${deleteFlag} ?`);
  
  const userManagementCollection = await mongoClient.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoClient.db("4pl-fleet").collection("staffs");
  const teamCollection = await mongoClient.db("4pl-fleet").collection("teams");
  const authUserCollection = await mongoClient.db("4pl-authentication").collection("users");
  const authPermissionCollection = await mongoClient.db("4pl-authentication").collection("details");
  
  await userManagementCollection.remove({ imported: deleteFlag, 'project.id': '5cf0ad79b603c7605955bc7f' })
  await staffsCollection.remove({ imported: deleteFlag, projectIds: ObjectId('5cf0ad79b603c7605955bc7f') })
  await teamCollection.remove({ imported: deleteFlag, projectId: ObjectId('5cf0ad79b603c7605955bc7f') })
  await authUserCollection.remove({ imported: deleteFlag })
  await authPermissionCollection.remove({ imported: deleteFlag })
  
  console.timeEnd(deleteFlag)
}

module.exports = deleteImportData
