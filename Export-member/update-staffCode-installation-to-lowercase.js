const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
var ObjectId = require('mongodb').ObjectID;
const _ = require('lodash')

const installationProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'installation';

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

(async () => {
    console.time('update staff code installation')

    const mongoEks = new MongoClient(
        'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
        {
            useNewUrlParser: true,
        }
    );
    await mongoEks.connect();

    // ## DB INSERT
    // const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
    // const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
    const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");

    // user
    const userWorkbook = xlsx.readFile('./importFile/installation/raw/Tech_consumer_set3_20201123-raw.xlsx');
    const userWorkbook_sheet_name_list = userWorkbook.SheetNames;
    let userStructures = xlsx.utils.sheet_to_json(userWorkbook.Sheets[userWorkbook_sheet_name_list[0]]);


    for (const userStructure of userStructures) {
        const code = String(userStructure.USER_CODE).trim()
        // const resU = await userManagementCollection.updateOne({imported: imported,employeeCode: code.toUpperCase()}, {$set: {employeeCode:code}})
        // console.log(resU.result.nModified)
        //
        // const resS = await staffsCollection.updateOne({imported: imported,'metaData.staffCode': code.toUpperCase()}, {$set: {'metaData.staffCode':code}})
        // console.log(resU.result.nModified)

        const resAU = await authUserCollection.updateOne({
            imported: imported,
            username: code.toUpperCase()
        }, {$set: {username: code}})

        console.log(resAU.result.nModified)
    }




    console.timeEnd('update staff code installation')
})();

// todo fix map zoneId not correct and takstypegroupIds
