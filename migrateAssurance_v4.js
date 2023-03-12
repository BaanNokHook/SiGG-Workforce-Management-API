const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';
const imported = 'assurance-2020-12-02-18-00';
const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

class User {
  _id;
  metadata = {
    qRun: {
      config: []
    }
  }
  staffIds = []
  name;


  constructor(user) {

  }
}

const importAssurance = async (name) => {
  console.time(`migrate upsert`)

  const mongoEks = new MongoClient(
    'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/',
    {
      useNewUrlParser: true,
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

  // skill
  const skillgroupsCollection = await mongoEks.db("4pl-authentication").collection("skillgroups");
  const skillgroups = await skillgroupsCollection.find({projectId: ObjectId("5cf0ad79b603c7605955bc7f")}).toArray();
  const skillgroupIds = await skillgroups.map(d => (d._id));

  const skillCollection = await mongoEks.db("4pl-authentication").collection("skills");
  const wfmSkills = await skillCollection.find({}).toArray();

  // ## DB INSERT
  // team
  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
  const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
  const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
  const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

  // csv
  let teamStructures = await csv().fromFile(`./importFile/assurance/v2/prod/export-TEAM_Structure-RNSO_PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์.csv`);
  let teamAreaCodes = await csv().fromFile(`./importFile/assurance/v2/prod/export-TeamServiceArea-RNSO_PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r2.csv`);
  let userStructures = await csv().fromFile(`./importFile/assurance/v2/prod/export-TEAM_member-RNSO-PilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r2.csv`);
  let userSkillStructures = await csv().fromFile(`./importFile/assurance/v2/prod/export-UserSkill-RNSO_pilotArea_บางกรวย-หนองจอก-คลองสามวา-บึงกุ่ม-แม่ฮ่องสอน-สุโขทัย-อุตรดิตถ์_r3.csv`);

  let reportNotFoundScabCode = []
  let reportNotFoundSkill = []
  let userPhoneNotCorrect = []
  let userEmailNotCorrect = []

  const teamsFromFile = teamStructures
    .map((teamStructure) => {
      const zone = teamAreaCodes
        .filter(teamAreaCode => String(teamAreaCode.TEAM_CODE).trim() === String(teamStructure.TEAM_CODE))
        .map(teamAreaCode => {

          const toZone = wfmTaskTypeGroups
            .filter(taskTypeGroup => taskTypeGroup.name === teamAreaCode.CATALOG_NAME.trim())
            .map(d => d._id);
          const zoneId = wfmZones
            .filter(wfmZone => {
              let rawZone = String(teamAreaCode.AREA_CODE).trim();
              return wfmZone?.metadata?.areaCode?.toString() === rawZone;
            });

          // not found scab code
          if (zoneId.length !== 1) {
            // debug team not link
            // all not filter === 7517
            // filter just 12 scab code not found
            if (String(teamAreaCode.AREA_CODE).trim().length !== 6) {
              reportNotFoundScabCode.push(teamAreaCode)
            }

            return
          }

          return {
            zoneId: zoneId[0]._id,
            areaCode: String(teamAreaCode.AREA_CODE).trim(),
            taskTypeGroupIds: toZone,
            shiftType: "All day",
            bufferType: "Point to point",
            _id: new ObjectId(),
            buffer: {
              hours: 0,
              minutes: 0
            }
          };
        })
        .filter(d => d !== undefined)

      return {
        _id: new ObjectId(),
        metadata: { qRun: { config: [] } },
        staffIds: [],
        name: teamStructure.TEAM_NAME.trim(),
        code: String(teamStructure.TEAM_CODE).trim(),
        parentId: teamStructure.TEAM_PARENT.trim(),
        contactPerson: "",
        telephone: "",
        description: "",
        zone: zone,
        teamTypeId: ObjectId("5d26eb7be702b4003a2da9ce"), // hardcode
        companyId: ObjectId("5cee7a9bfc47036f05b13847"), // hardcode
        projectId: ObjectId(assuranceProjectId), // hardcode
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        deleted: false,
        "__v": 0,
        imported: imported,
      };
    })
    .map((d, index, currTeams) => {
      let parentId = null;
      if (d.parentId !== "0000-00") {
        parentId = currTeams.filter(currTeam => d.parentId === currTeam.code)[0]._id;
      }
      return {
        ...d,
        parentId: parentId
      };
    });

  const teamsFromDB = await teamCollection.find({}).toArray()

  const baseUsers = userStructures
    .map(userStructure => {
      const skillIds = userSkillStructures
        .filter(userSkillStructure => userSkillStructure['USER_CODE'] === userStructure['USER_CODE'])
        .map(userSkillStructure => {
          const skillIds = wfmSkills
            .filter(wfmSkill => wfmSkill.name === userSkillStructure['SKILL_NAME'])
            .map(wfmSkill => wfmSkill._id);

          if (skillIds.length === 0) {
            reportNotFoundSkill.push(userSkillStructure['SKILL_NAME'])
            return
          }

          return {
            _id: new ObjectId(),
            skill: skillIds[0],
            level: 1
          };
        })
        .filter(d => d !== undefined)

      const teamCode = String(userStructure['TEAM_CODE'])
      let teamId = teamsFromFile.filter(team => team.code === teamCode);

      // not found team in import file
      if (teamId[0] === undefined) {
        teamId = teamsFromDB.filter(team => team.code === teamCode);
      }

      // first name, last name
      const nameSplitLen = userStructure['USER_NAME'].trim().replace(/\s+/g, ' ').split(' ').length
      const name = userStructure['USER_NAME'].trim().replace(/\s+/g, ' ').split(' ')
      let firstname = ''
      let lastname = ''
      if (nameSplitLen === 2) {
        firstname = name[0]
        lastname = name[1]
      }
      if (nameSplitLen === 3) {
        firstname = name[1]
        lastname = name[2]
      }
      if (nameSplitLen === 1) {
        firstname = userStructure['USER_NAME'].trim()
      }
      if (nameSplitLen > 3) {
        firstname = userStructure['USER_NAME'].trim()
        lastname = ''
      }

      // phone, email
      let phone, email
      if (userStructure['PHONE_NO'] === undefined || userStructure['PHONE_NO'].length !== 10) {
        userPhoneNotCorrect.push(userStructure)
        phone = '9999999999'
      }
      if (!isValidateEmail(userStructure['E_MAIL'])) {
        userEmailNotCorrect.push(userStructure)
        email = 'dump@dump.com'
      }

      let lat = Number(userStructure['WORK_LATITUDE'])
      let long = Number(userStructure['WORK_LONGITUDE'])
      if (isNaN(Number(userStructure['WORK_LATITUDE'])) === true || isNaN(Number(userStructure['WORK_LONGITUDE'])) === true) {
        lat = 13.68429
        long = 100.61095
      }

      return {
        genUserId: new ObjectId(),
        genStaffId: new ObjectId(),
        userCode: String(userStructure['USER_CODE']).trim().toUpperCase(),
        name: userStructure['USER_NAME'].trim(),
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
      };
    });

  let reportNotFoundSkillUnique = [...new Set(reportNotFoundSkill)];

  // Map data for database
  const teamsWithStaffs = teamsFromFile.map(team => {
    const staffIds = baseUsers
      .filter(baseUser => baseUser.teamCode === team.code)
      .map(baseUser => baseUser.genStaffId);

    return {
      ...team,
      staffIds: staffIds
    };
  });

  const userManagement = baseUsers.map(d => {
    let staffSkills = d.skills.map(skill => ({
      skill: skill.skill.toHexString(),
      level: skill.level
    })
    );

    const teams = d.teamId === "" || d.teamName === "" ? [] : [
      {
        "_id": d.teamId.toHexString(),
        "name": d.teamName
      }
    ]


    return {
      _id: d.genUserId.toHexString(),
      active: true,
      birthDate: 0,
      citizenID: d.citizenId,
      company: {
        id: "5cee7a9bfc47036f05b13847" // fix
      },
      createdAt: parseInt(Date.now() / 1000),
      updatedAt: parseInt(Date.now() / 1000),
      email: d.email,
      emergencyContact: {
        name: "",
        phone: ""
      },
      employeeCode: d.userCode,
      gender: "unknown",
      location: d.location,
      name: `${d.firstname} ${d.lastname}`,
      phone: d.phone,
      project: {
        id: assuranceProjectId
      },
      remark: "",
      roles: [
        {
          _id: "5f0ff1f0e22b240011e52501",
          name: "TECHNICIAN"
        },
      ],
      staffSkills: staffSkills,
      teams: teams,
      imported: imported
    };
  });

  const staffs = baseUsers.map(d => {
    return {
      "_id": d.genStaffId,
      "metaData": {
        "isRequestTaxiInsurance": false,
        "isPassTraining": false,
        "staffCode": d.userCode,
        "drivings": []
      },
      "defaultLocation": {
        "coordinates": [
          d.location.long,
          d.location.lat
        ],
        "type": "Point"
      },
      "teamIds": d.teamId === "" ? [] : [ObjectId(d.teamId)],
      "projectIds": [
        ObjectId(assuranceProjectId)
      ],
      "companyId": ObjectId("5cee7a9bfc47036f05b13847"),
      "availableServices": [],
      "deleted": false,
      "userId": d.genUserId, // generate userId
      "citizenId": d.citizenId,
      "staffSkills": d.skills,
      "firstname": d.firstname,
      "lastname": d.lastname,
      "location": {
        "type": "Point",
        "coordinates": [
          0,
          0
        ]
      },
      "phone": d.phone,
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString(),
      "__v": 0,
      "imported": imported
    };
  });

  const authUser = baseUsers.map(d => {
    return {
      "_id": d.genUserId,
      "resetPasswordInfo": {
        "isTokenUsed": false
      },
      "metaData": {
        "trueRydeServices": []
      },
      "validatePassword": {
        "verifiedAt": null
      },
      "isActive": true,
      "isVerifyDocument": false,
      "isTmnLogin": false,
      "citizenId": d.citizenId,
      "laserCode": "",
      "gender": "",
      "deleted": false,
      "username": d.userCode,
      "phone": d.phone,
      "password": passwordHash.generate(d.phone),
      "firstname": d.firstname,
      "lastname": d.lastname,
      "permissions": [],
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString(),
      "__v": 0,
      imported: imported
    };
  });

  const authPermission = baseUsers.map(d => {
    return {
      "_id": new ObjectId(),
      "startDate": null,
      "expireDate": null,
      "inviteMessage": "Welcome",
      "deleted": false,
      "user": d.genUserId, // userId
      "role": ObjectId("5f0ff1f0e22b240011e52501"),
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString(),
      "__v": 0,
      imported: imported
    };
  });

  // write report
  await fs.writeFile(`report/assurance/v2/notFoundScabCode-${name}.json`, JSON.stringify(reportNotFoundScabCode, null, 2))
  await fs.writeFile(`report/assurance/v2/notFoundSkillUnique-${name}.json`, JSON.stringify(reportNotFoundSkillUnique, null, 2))
  await fs.writeFile(`report/assurance/v2/userPhoneNotCorrect-${name}.json`, JSON.stringify(userPhoneNotCorrect, null, 2))
  await fs.writeFile(`report/assurance/v2/userEmailNotCorrect-${name}.json`, JSON.stringify(userEmailNotCorrect, null, 2))

  const teamInsertCount = await teamCollection.insertMany(teamsWithStaffs);
  const userManagementInsertCount = await userManagementCollection.insertMany(userManagement);
  const staffsInsertCount = await staffsCollection.insertMany(staffs);
  const authUserInsertCount = await authUserCollection.insertMany(authUser);
  const authPermissionInsertCount = await authPermissionCollection.insertMany(authPermission);

  console.timeEnd(`migrate upsert`)
}

(async () => {
  // await importAssurance('Outsource')
  // await importAssurance('RNSO-BMA')
  // await importAssurance('RNSO-UPC1')
  await importAssurance('PROD')
})()
