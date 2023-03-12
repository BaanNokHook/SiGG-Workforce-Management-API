const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-2020-12-11-08-20';
const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

const updateTeam = async (name) => {
    console.time(`update team`)

    const mongoEks = new MongoClient(
        // 'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-1.mongo.datastore.staging.tel.internal/?authSource=admin',
        'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );
    await mongoEks.connect();


    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
    const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
    const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");

    let userStructures = await csv().fromFile(`./importFile/assurance/v2/prod/outsource-addOn/export-Approver-TEAM_member-AddOn_r2.csv`);
    const teamCodes = userStructures.map(d => d.TEAM_CODE)


    const teamsFromDB = await teamCollection.find({code: {$in: teamCodes}, projectId: ObjectId(assuranceProjectId)}).toArray()
    const staffFromDB = await staffsCollection.find({"projectIds": ObjectId(assuranceProjectId)}).toArray()


    for (const userStructure of userStructures) {
        const teamCode = userStructure.TEAM_CODE

        const teamId = teamsFromDB.filter(t => t.code === teamCode)
        if (teamId.length === 0) throw teamCode

        const teamStaff = await  staffsCollection.find({"projectIds": ObjectId(assuranceProjectId), teamIds: teamId[0]._id}).toArray()
        const teamStaffIds = teamStaff.map(d => d._id)

        const resS = await teamCollection.updateOne({code: teamCode, projectId: ObjectId(assuranceProjectId)}, {
            $set: {
                staffIds: teamStaffIds
            }
        })

        console.log(resS.result.nModified)
    }

    console.timeEnd(`update team`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await updateTeam('UAT')
})()
