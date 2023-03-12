const MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

const assuranceProjectId = "5cf0ad79b603c7605955bc7f";
const imported = "assurance-UPC-2021-01-29T11:12";

(async () => {
  console.time("delete");

  const mongoEks = new MongoClient(
    "mongodb+srv://devsupport2:BjsH43eLzSP5djwT@drivs-loadtest.21cur.mongodb.net/?authSource=admin",
    {
      useNewUrlParser: true,
    }
  );
  await mongoEks.connect();

  const userManagementCollection = await mongoEks
    .db("4pl-user-management")
    .collection("users");
  const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
  const authUserCollection = await mongoEks
    .db("4pl-authentication")
    .collection("users");
  const authPermissionCollection = await mongoEks
    .db("4pl-authentication")
    .collection("details");

  await userManagementCollection.remove({
    imported: { $in: [imported] },
    projectIds: ObjectId("5cf0ad79b603c7605955bc7f"),
  });
  await teamCollection.remove({
    imported: { $in: [imported] },
    projectId: ObjectId("5cf0ad79b603c7605955bc7f"),
  });
  await authUserCollection.remove({
    imported: { $in: [imported] },
  });
  await authPermissionCollection.remove({
    imported: { $in: [imported] },
  });

  console.timeEnd("delete");
})();
