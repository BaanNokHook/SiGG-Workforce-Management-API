import xlsx from 'xlsx'
import csv from 'csvtojson'
import {MongoClient, ObjectID} from "mongodb"

const imported = 'assurance-2020-12-02-18-00';
const assuranceProjectId = '5cf0ad79b603c7605955bc7f';

// todo index project id & identity
// todo upsert migration

const cleanString = (str) => {
    return String(str).trim()
}

const migrateAssurance = async () => {
    console.time(`assurance`)

    const mongoEks = new MongoClient(
        'mongodb://localhost',
        // 'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/',
        {
            useNewUrlParser: true,
        }
    );
    await mongoEks.connect();

    const userCollection = await mongoEks.db("4pl-user-management").collection("users");
    const userFilter = {'project.id': assuranceProjectId}
    const userDbs = await userCollection.find(userFilter).toArray();

    const staffCollection = await mongoEks.db("4pl-fleet").collection("staffs");
    const staffFilter = {projectIds: ObjectID(assuranceProjectId)}
    const staffDbs = await staffCollection.find(staffFilter).toArray();

    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
    const teamFilter = {projectId: ObjectID(assuranceProjectId)}
    const teamDbs = await teamCollection.find(teamFilter).toArray();

    const authCollection = await mongoEks.db("4pl-authentication").collection("users");
    const authDbs = await authCollection.find({}).toArray();

    const permissionCollection = await mongoEks.db("4pl-authentication").collection("details");
    const permissionDbs = await permissionCollection.find({}).toArray()

    const userMigrateFile = "./importFile/assurance/v2/prod/export-TEAM_member-RNSO-PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r2.csv"
    const teamMigrateFile = "./importFile/assurance/v2/prod/export-TEAM_Structure-RNSO_PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์.csv"
    const areaCodeMigrateFile = "./importFile/assurance/v2/prod/export-TeamServiceArea-RNSO_PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r2.csv"
    const skillMigrateFile = "./importFile/assurance/v2/prod/export-UserSkill-RNSO_pilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r3.csv"

    const userMigrates = await csv().fromFile(userMigrateFile);
    const teamMigrates = await csv().fromFile(teamMigrateFile);
    const areaCodeMigrates = await csv().fromFile(areaCodeMigrateFile);
    const skillMigrates = await csv().fromFile(skillMigrateFile);

    let reportNotFoundAreaCode = []
    let reportNotFoundSkill = []
    let userPhoneNotCorrect = []
    let userEmailNotCorrect = []


    const baseUsersMigrate = [...userDbs]
    for (const userMigrate of userMigrates) {
        let foundInDBIndex;
        userDbs.forEach((userDb, i) => {
            if (userDb.employeeCode === userMigrate.USER_CODE) foundInDBIndex = i
        })

        if (foundInDBIndex === undefined) {
            // insert
            baseUsersMigrate.push({
                genUserId: new ObjectID(),
                genStaffId: new ObjectID(),
                userCode: cleanString(userMigrate.USER_CODE).toUpperCase(),
                name: cleanString(userMigrate.USER_NAME),
                firstname: firstname,
                lastname: lastname,
                phone: phone || userStructure['PHONE_NO'].trim(),
                email: email || String(userStructure['E_MAIL']).trim().toLowerCase(),
                teamCode: String(teamCode).trim(),
                teamId: teamId[0]?._id || "", // todo mark
                teamName: teamId[0]?.name || "", // todo  mark
                skills: skillIds,
                password: passwordHash.generate(phone || userStructure['PHONE_NO'].trim()),
                citizenId: String(Math.floor(Math.random() * 10000000000000)),
                location: {
                    lat: lat,
                    long: long
                }
            })
        } else {
            // update
        }

        console.log(userMigrate)
    }

    console.timeEnd(`assurance`)
}

export default migrateAssurance