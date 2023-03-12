const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson');
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-2021-01-14';
const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

const updateTeam = async (name) => {
    console.time(`check auth auplicate`)

    const mongoEks = new MongoClient(
        'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );
    await mongoEks.connect();

    const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
    const auths = await authUserCollection.find({imported: {'$exists': true}}).toArray()

    const obj = {}
    auths.forEach(auth => {
        if (obj[auth.username] === undefined) {
            obj[auth.username] = []
        }
        obj[auth.username].push(auth)
    })

    const result = []
    for (const key in obj) {
        if (obj[key].length > 1) {
            result.push(key)
        }
    }

    console.timeEnd(`check auth auplicate`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await updateTeam('UAT')
})()
