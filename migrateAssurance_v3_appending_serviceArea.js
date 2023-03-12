const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-2020-12-03-13-00';
const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

const importAssurance = async (name) => {
    console.time(`migrate assurance v3 appending service area ${name}`)

    const mongoEks = new MongoClient(
        'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-1.mongo.datastore.staging.tel.internal/?authSource=admin',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );
    await mongoEks.connect();

    // ## DB FIND
    // task type group
    const taskTypeGroupsCollection = await mongoEks.db("4pl-tms").collection("tasktypegroups");
    const wfmTaskTypeGroups = await taskTypeGroupsCollection.find({}).toArray();

    // zone type group
    const zoneCollection = await mongoEks
        .db("4pl-address-and-zoning")
        .collection("geographies");
    const wfmZones = await zoneCollection
        .find({'metadata.isFromCustomer': false})
        .toArray();

    // ## DB INSERT
    // team
    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");

    // csv
    // let teamStructures = await csv().fromFile(`./importFile/assurance/v3-appending/TeamStructure-AddOn.csv`);
    let teamAreaCodes = await csv().fromFile(`./importFile/assurance/v3-appending/TeamServiceArea-AddOn.csv`);
    let teamAreaCodes2 = await csv().fromFile(`./importFile/assurance/v2/uat/export-TeamServiceArea-RNSO_PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์.csv`);

    let reportNotFoundScabCode = []
    let reportNotFoundSkill = []
    let userPhoneNotCorrect = []
    let userEmailNotCorrect = []

    const teams = await teamCollection.find({projectId: ObjectId(assuranceProjectId)}).toArray()

    const teamAreaCodesMerges = [...teamAreaCodes, ...teamAreaCodes2]
    const updateTeamAreaCode = {}

    teamAreaCodesMerges.forEach((teamAreaCodesMerge) => {
        const toZone = wfmTaskTypeGroups
            .filter(taskTypeGroup => taskTypeGroup.name === teamAreaCodesMerge.CATALOG_NAME.trim())
            .map(d => d._id);
        const zoneId = wfmZones
            .filter(wfmZone => {
                let rawZone = String(teamAreaCodesMerge.AREA_CODE).trim();
                if (typeof wfmZone.metadata?.areaCode !== 'string') return false
                return wfmZone.metadata?.areaCode?.toString() === rawZone;
            });

        // not found scab code
        if (zoneId.length !== 1) {
            reportNotFoundScabCode.push(teamAreaCodesMerge)
            return
        }

        if (updateTeamAreaCode[teamAreaCodesMerge.TEAM_CODE] === undefined) {
            updateTeamAreaCode[teamAreaCodesMerge.TEAM_CODE] = []
        }

        updateTeamAreaCode[teamAreaCodesMerge.TEAM_CODE].push({
            zoneId: zoneId[0]._id,
            areaCode: String(teamAreaCodesMerge.AREA_CODE).trim(),
            taskTypeGroupIds: toZone,
            shiftType: "All day",
            bufferType: "Point to point",
            _id: new ObjectId(),
            buffer: {
                hours: 0,
                minutes: 0
            }
        })

    })

    // write report
    await fs.writeFile(
        `report/assurance/v2/notFoundScabCode-appending-service-area-${name}.json`,
        JSON.stringify(reportNotFoundScabCode, null, 2)
    )

    for (const key in updateTeamAreaCode) {
        const res = await teamCollection.updateOne({code: String(key).trim()}, {$set: {zone: updateTeamAreaCode[key]}})
        console.log(key, res.result.nModified)
    }

    console.timeEnd(`migrate assurance v3 appending service area ${name}`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await importAssurance('UAT')
})()
