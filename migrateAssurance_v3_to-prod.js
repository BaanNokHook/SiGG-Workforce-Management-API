const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-2020-12-10-17-10';
const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

const importAssurance = async (name) => {
    console.time(`migrate assurance to prod`)

    const mongoEks = new MongoClient(
        'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-1.mongo.datastore.staging.tel.internal/?authSource=admin',
        {
            useNewUrlParser: true,
        }
    );
    await mongoEks.connect();

    const mongoProd = new MongoClient(
        'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin',
        {
            useNewUrlParser: true,
        }
    );
    await mongoProd.connect();

    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
    const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
    const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
    const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
    const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

    const teams = await teamCollection.find({imported: {$regex: /assur/}}).toArray()
    const users = await userManagementCollection.find({imported: {$regex: /assur/}}).toArray()
    const staffs = await staffsCollection.find({imported: {$regex: /assur/}}).toArray()
    const auths = await authUserCollection.find({imported: {$regex: /assur/}}).toArray()
    const permission = await authPermissionCollection.find({imported: {$regex: /assur/}}).toArray()

    const teamCollectionP = await mongoProd.db("4pl-fleet").collection("teams");
    const userManagementCollectionP = await mongoProd.db("4pl-user-management").collection("users");
    const staffsCollectionP = await mongoProd.db("4pl-fleet").collection("staffs");
    const authUserCollectionP = await mongoProd.db("4pl-authentication").collection("users");
    const authPermissionCollectionP = await mongoProd.db("4pl-authentication").collection("details");


    await teamCollectionP.insertMany(teams)
    await userManagementCollectionP.insertMany(users)
    await staffsCollectionP.insertMany(staffs)
    await authUserCollectionP.insertMany(auths)
    await authPermissionCollectionP.insertMany(permission)


    console.timeEnd(`migrate assurance to prod`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await importAssurance('UAT')
})()
