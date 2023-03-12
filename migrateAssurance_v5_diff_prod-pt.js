const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-BMA-2021-01-21';

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

const importAssurance = async (name) => {
    console.time(`migrate v5`)

    const mongoProd = new MongoClient(
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
    await mongoProd.connect();

    const mongoPt = new MongoClient(
        // prod
        // 'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin',
        // staging
        // 'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
        // pt
        'mongodb+srv://devsupport2:BjsH43eLzSP5djwT@drivs-loadtest.21cur.mongodb.net/?authSource=admin',
        {
            useNewUrlParser: true,
        }
    );
    await mongoPt.connect();


    // ## DB INSERT
    // team

    const staffsProdCollection = await mongoProd.db("4pl-fleet").collection("staffs");
    const staffsPtCollection = await mongoPt.db("4pl-fleet").collection("staffs");

    const staffsProdFromDB = await staffsProdCollection.find({projectIds: ObjectId(assuranceProjectId)}).toArray()
    const staffsPtFromDB = await staffsPtCollection.find({projectIds: ObjectId(assuranceProjectId)}).toArray()

    const sProd = staffsProdFromDB.map(d=> d.metaData.staffCode)
    const sPt = staffsPtFromDB.map(d=> d.metaData.staffCode)

    const notFound = []
    for (const prod of sProd) {
        let found = false
        for (const pt of sPt) {
            if (prod === pt) {
                found = true
                break
            }
        }

        if (!found) {
            notFound.push(prod)
        }
    }




    // const teamProdCollection = await mongoProd.db("4pl-fleet").collection("teams");
    // const teamPtCollection = await mongoPt.db("4pl-fleet").collection("teams");
    //
    // const teamsProdFromDB = await teamProdCollection.find({projectId: ObjectId(assuranceProjectId)}).toArray()
    // const teamsPtFromDB = await teamPtCollection.find({projectId: ObjectId(assuranceProjectId)}).toArray()
    //
    // const tProd = teamsProdFromDB.map(d=> d.code)
    // const tPt = teamsPtFromDB.map(d=> d.code)
    //
    // const tDiff = tPt.filter(d => {
    //     return !tProd.includes(d)
    // })



    // write report
    // await fs.writeFile(`report/assurance/v5/${name}_teamNotFoundAreaCode.json`, JSON.stringify(reportTeamNotFoundAreaCode, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffNotFoundSkill.json`, JSON.stringify(reportNotFoundSkill, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffPhoneNotCorrect.json`, JSON.stringify(reportStaffPhoneNotCorrect, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffEmailNotCorrect.json`, JSON.stringify(reportStaffEmailNotCorrect, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_teamDuplicate.json`, JSON.stringify(reportTeamDuplicate, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffDuplicate.json`, JSON.stringify(reportStaffDuplicate, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffMapTeamInDB.json`, JSON.stringify(reportStaffMapTeamInDB, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_staffNotLinkTeam.json`, JSON.stringify(reportStaffNotLinkTeam, null, 2))
    // await fs.writeFile(`report/assurance/v5/${name}_summary.text`, `team len: ${teamsWithStaffs.length} | staff len: ${userManagement.length}`)

    // const teamInsertCount = await teamCollection.insertMany(teamsWithStaffs);
    // const userManagementInsertCount = await userManagementCollection.insertMany(userManagement);
    // const staffsInsertCount = await staffsCollection.insertMany(staffs);
    // const authUserInsertCount = await authUserCollection.insertMany(authUser);
    // const authPermissionInsertCount = await authPermissionCollection.insertMany(authPermission);



    console.timeEnd(`migrate v5`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await importAssurance('2021-01-21-pt')
})()
