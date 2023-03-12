const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
// v1
// const imported = 'assurance-appending-2021-01-17-add-role';

// v2
// const imported = 'assurance-appending-2021-01-17-add-role-v2';

// v3
// const imported = 'assurance-appending-2021-01-20-add-role-v3';

// v4
const imported = 'assurance-BMA-2021-01-24';

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

const importAssurance = async (name) => {
  console.time(name)

  const mongoEks = new MongoClient(
      // prod
      'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin',
      // staging
      // 'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
      // pt
      // 'mongodb+srv://devsupport2:BjsH43eLzSP5djwT@drivs-loadtest.21cur.mongodb.net/?authSource=admin',
      {
        useNewUrlParser: true,
      }
  );
  await mongoEks.connect();

  const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
  const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
  const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

  // csv
  const insertRoles = []
  const moreThanOne = []
  let roleStructures = await csv().fromFile(`./importFile/assurance/v5/BMA/export-BMA_Leader_role_21Jan2021.csv`);

  // PT role team leader
  const roleName = "TEAM_LEADER"
  const roleId = "5f0ff6fee22b240011e52504"

  // PT
  // const roleName = "ZONE_MONITOR_ROUTER"
  // const roleId = "5f0ff495e22b240011e52503"

  const duplicateUserRole = []

  for (const roleStructure of roleStructures) {
    const userCode = roleStructure['USER_CODE'].toString()

    // !!! USER
    const user = await userManagementCollection.findOne({
      employeeCode: userCode,
      "project.id": "5cf0ad79b603c7605955bc7f"
    })

    if (!user) {
      continue
    }
    if (user.roles.filter(d => d.name === roleName).length > 0) {
      duplicateUserRole.push(userCode)
      continue
    }

    const roles = user.roles
    roles.push({_id: roleId, name: roleName})
    await userManagementCollection.updateOne({
          employeeCode: userCode,
          "project.id": "5cf0ad79b603c7605955bc7f"
        }, {
          $set: {
            roles: roles,
            importUpdated: name
          }
        }
    )

    // !!! AUTH
    const authUser = await authUserCollection.find({username: userCode}).toArray()
    if (authUser.length > 1) {
      // console.log(`${userCode} more than 1`)
      moreThanOne.push(userCode)
      continue
    }
    if (authUser.length === 0) {
      // console.log(`${userCode} not found`)
      continue
    }

    const duplicate = await  authPermissionCollection.findOne({
      user: authUser[0]._id, role: ObjectId(roleId)
    })
    if (!duplicate) {
      insertRoles.push({
        "_id": new ObjectId(),
        "startDate": null,
        "expireDate": null,
        "inviteMessage": "Welcome",
        "deleted": false,
        "user": authUser[0]._id, // userId
        "role": ObjectId(roleId),
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "__v": 0,
        imported: imported
      })
    }
  }

  const authPermissionInsertCount = await authPermissionCollection.insertMany(insertRoles);

  console.timeEnd(name)
}

(async () => {
  // await importAssurance('Outsource')
  // await importAssurance('RNSO-BMA')
  // await importAssurance('RNSO-UPC1')
  try {
    await importAssurance('assurance-BMA-2021-01-24')
  } catch (e) {
    console.error(e)
  }
})()
