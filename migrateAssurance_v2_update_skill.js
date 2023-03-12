const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-outsource-2020-12-22-45-00';

function isValidateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).trim().toLowerCase());
}

const importAssurance = async (name) => {
    console.time(`migrate assurance ${name}`)

    const mongoEks = new MongoClient(
        'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    await mongoEks.connect();

    // ## DB FIND
    // task type group
    // const taskTypeGroupsCollection = await mongoEks.db("4pl-tms").collection("tasktypegroups");
    // const wfmTaskTypeGroups = await taskTypeGroupsCollection.find({}).toArray();

    // zone type group
    // const zoneCollection = await mongoEks
    //     .db("4pl-address-and-zoning")
    //     .collection("geographies");
    // const wfmZones = await zoneCollection
    //     .find({'metadata.isFromCustomer': false})
    //     .toArray();

    // skill
    const skillgroupsCollection = await mongoEks.db("4pl-authentication").collection("skillgroups");
    const skillgroups = await skillgroupsCollection.find({projectId: ObjectId("5cf0ad79b603c7605955bc7f")}).toArray();
    const skillgroupIds = await skillgroups.map(d => (d._id));

    const skillCollection = await mongoEks.db("4pl-authentication").collection("skills");
    const wfmSkills = await skillCollection.find({}).toArray();

    // roles
    const roleCollection = await mongoEks.db("4pl-authentication").collection("roles");
    const roles = await roleCollection.find({
        name: {$in: ["SYSTEM_ADMIN", "TEAM_LEADER", "TECHNICIAN"]},
        typeId: ObjectId("5cf0ad79b603c7605955bc7f")
    }).toArray();

    // ## DB INSERT
    // team
    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
    const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
    const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
    const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
    const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

    // csv
    // let teamStructures = await csv().fromFile(`./importFile/assurance/v2/prod/outsource/export-TEAM_Structure-OutSource-PilotArea.csv`);
    // let teamAreaCodes = await csv().fromFile(`./importFile/assurance/v2/prod/outsource/export-TeamServiceArea-Outsource-Pilot_r2.csv`);
    // let userStructures = await csv().fromFile(`./importFile/assurance/v2/prod/update-skill/export-UserSkill-15Dec2020.csv`);
    let userSkills = await csv().fromFile(`./importFile/assurance/v2/prod/update-skill-v2/export-UserSkill-16Dec2020.csv`);


    let updateSkills = {}
    userSkills.forEach(userSkill => {
        if (updateSkills[String(userSkill.USER_CODE)] === undefined) {
            updateSkills[String(userSkill.USER_CODE)] = []
        }

        const getSkillId = wfmSkills.filter(d => d.name === userSkill.SKILL_NAME)
        if (getSkillId.length === 0) throw `error ${userSkill.SKILL_NAME}`

        updateSkills[String(userSkill.USER_CODE)].push({
            _id: getSkillId[0]._id,
        })
    })

    for (const key in updateSkills) {
        const userSkills = updateSkills[key].map(d => ({skill: d._id.toString(), level: 1}))
        const uRes = await userManagementCollection.updateOne({employeeCode: key, 'project.id': "5cf0ad79b603c7605955bc7f"},  {
            $set: {
                staffSkills: userSkills
            }
        })

        const staffSkills = updateSkills[key].map(d => ({_id: ObjectId(), skill: d._id, level: 1}))
        const sRes = await staffsCollection.updateOne({'metaData.staffCode': key, projectIds: ObjectId("5cf0ad79b603c7605955bc7f")},  {
            $set: {
                staffSkills: staffSkills
            }
        })

        console.log('u', uRes.result.nModified, 's', sRes.result.nModified)
    }

    console.timeEnd(`migrate assurance ${name}`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    await importAssurance('PROD outsource')
})()
