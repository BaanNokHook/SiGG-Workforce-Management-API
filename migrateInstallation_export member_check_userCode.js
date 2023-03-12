const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
var ObjectId = require('mongodb').ObjectID;
const _ = require('lodash')

const installationProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'installation-prod-2021-01-07';

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

(async () => {
  console.time('migrate installation')

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


  const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
  const users = await userManagementCollection.find().toArray()

 const unique = {}

  users.forEach(d => {
    if (unique[d.employeeCode] === undefined) {
      unique[d.employeeCode] = {item: 1, phone: []}
      unique[d.employeeCode].phone.push(d.phone)
    }
    else {
      unique[d.employeeCode].phone.push(d.phone)
      unique[d.employeeCode].item += 1
    }
  })

  const uniqueA = []
  for (const key in unique) {
    if (unique[key].item > 1) {
      uniqueA.push({
        code: key,
          phones: unique[key].phone
      })
    }
  }

  console.log('dd')

})();

// todo fix map zoneId not correct and takstypegroupIds
