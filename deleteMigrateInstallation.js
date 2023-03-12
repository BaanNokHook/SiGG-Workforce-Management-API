const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'installation';

(async () => {
  console.time('delete installation')

  const mongoEks = new MongoClient(
    'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
    {
      useNewUrlParser: true,
    }
  );
  await mongoEks.connect();

  const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
  const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
  const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

  await userManagementCollection.remove({imported: imported, 'project.id': assuranceProjectId})
  await staffsCollection.remove({imported: imported, projectIds: ObjectId(assuranceProjectId)})
  await teamCollection.remove({imported: imported, projectId: ObjectId(assuranceProjectId)})
  await authUserCollection.remove({imported: imported})
  await authPermissionCollection.remove({imported: imported})

  console.timeEnd('delete installation')
})()