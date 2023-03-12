const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
var ObjectId = require('mongodb').ObjectID;
const _ = require('lodash')

const installationProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'v2';

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

(async () => {
  console.time('migrate installation')

  const mongoEks = new MongoClient(
    'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
    {
      useNewUrlParser: true,
    }
  );
  await mongoEks.connect();

  // ## DB FIND
  // task type group
  const taskTypeGroupsCollection = await mongoEks.db("4pl-tms").collection("tasktypegroups");
  const wfmTaskTypeGroups = await taskTypeGroupsCollection.find({}).toArray();

  // ## DB INSERT
  // team
  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
  const userManagementCollection = await mongoEks.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");
  const authUserCollection = await mongoEks.db("4pl-authentication").collection("users");
  const authPermissionCollection = await mongoEks.db("4pl-authentication").collection("details");

  // ## xlsx
  // team
  const teamsWorkbook = xlsx.readFile('./importFile/installation/forTestOptimize/installation_team_set3_20201116_2.xlsx');
  const team_sheet_name_list = teamsWorkbook.SheetNames;
  let teamStructures = xlsx.utils.sheet_to_json(teamsWorkbook.Sheets[team_sheet_name_list[0]]);

  // user
  const userWorkbook = xlsx.readFile('./importFile/installation/forTestOptimize/Tech_consumer_set3_20201123.xlsx');
  const userWorkbook_sheet_name_list = userWorkbook.SheetNames;
  let userStructures = xlsx.utils.sheet_to_json(userWorkbook.Sheets[userWorkbook_sheet_name_list[0]]);

  let userPhoneNotCorrect = []
  let userEmailNotCorrect = []
  let userNotLinkTeam = []

  let teamsFromFile = teamStructures
    .filter((teamStructure) => teamStructure["team_name "] !== undefined || teamStructure.Team_code !== undefined || teamStructure["team_name "] !== undefined)
    .map((teamStructure) => {
      return {
        _id: new ObjectId(),
        metadata: {qRun: {config: []}},
        staffIds: [],
        name: String(teamStructure["team_name "]).trim(),
        code: String(teamStructure.Team_code),
        parentId: String(teamStructure.Parent_Teamcode).trim(),
        contactPerson: "",
        telephone: "",
        description: "",
        zone: [],
        teamTypeId: ObjectId("5d26eb7be702b4003a2da9ce"), // hardcode
        companyId: ObjectId("5cee7a9bfc47036f05b13847"), // hardcode
        projectId: ObjectId(installationProjectId), // hardcode
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
  teamsFromFile = _.unionBy(teamsFromFile, 'name')

  const baseUsers = userStructures
    .map(userStructure => {
      const teamCode = userStructure['TEAM_CODE'] === true ? 'TRUE' : String(userStructure['TEAM_CODE'])
      let teamId = teamsFromFile.filter(team => team.code === teamCode);

      if (teamId[0] === undefined) {
        userNotLinkTeam.push(userStructure)
        teamId.push({
          _id: "",
          name: "",
          parentId: "not have"
        })
      }

      // first name, last name
      const nameSplitLen = userStructure['USER_NAME'].trim().replace(/\s+/g, ' ').split(' ').length
      const name = userStructure['USER_NAME'].trim().replace(/\s+/g, ' ').split(' ')
      let firstname = ''
      let lastname = ''
      if (nameSplitLen === 1){
        firstname = name
      }
      if (nameSplitLen === 2) {
        firstname = name[0]
        lastname = name[1]
      }
      if (nameSplitLen === 3) {
        firstname = name[1]
        lastname = name[2]
      }

      // phone, email
      let phone, email
      if (userStructure['CONTACT_NO'] === undefined || userStructure['CONTACT_NO'].length !== 10) {
        userPhoneNotCorrect.push(userStructure)
        phone = '9999999999'
      }
      if (!isValidateEmail(userStructure['EMAIL'])) {
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
        userCode: userStructure['USER_CODE'].trim(),
        name: userStructure['USER_NAME'].trim(),
        firstname: firstname,
        lastname: lastname,
        phone: phone || userStructure['CONTACT_NO'].trim(),
        email: email || userStructure['EMAIL'].trim().toLowerCase(),
        teamCode: teamCode.trim(),
        teamId: teamId[0]._id,
        teamName: teamId[0].name,
        isRootTeam: teamId[0].parentId === null ? true : false,
        skills: [],
        password: passwordHash.generate(phone || userStructure['CONTACT_NO'].trim()),
        citizenId: String(Math.floor(Math.random() * 10000000000000)),
        location: {
          lat: lat,
          long: long
        }
      };
    });

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

    let teams = []
    if (d.teamId !== "") {
      teams.push({
        "_id": d.teamId.toHexString(),
        "name": d.teamName
      })
    }

    let roles = []
    if (d.isRootTeam) {
      roles.push({
        _id: "5f89624ea009ca2df086d520",
        name: "ZONE_MONITOR_ROUTER"
      })
    } else {
      roles.push({
        _id: "5f8961d5a009ca2df086b37b",
        name: "TECHNICIAN"
      })
    }

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
        id: installationProjectId
      },
      remark: "",
      roles: roles,
      staffSkills: staffSkills,
      teams: teams,
      imported: imported
    };
  });

  const staffs = baseUsers.map(d => {
    const teamIds = []
    if (d.teamId !== "") {
      teamIds.push(ObjectId(d.teamId))
    }

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
      "teamIds": teamIds,
      "projectIds": [
        ObjectId(installationProjectId)
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
    let role
    if (d.isRootTeam) {
      role = ObjectId("5f89624ea009ca2df086d520")
    } else {
      role = ObjectId("5f8961d5a009ca2df086b37b")
    }

    return {
      "_id": new ObjectId(),
      "startDate": null,
      "expireDate": null,
      "inviteMessage": "Welcome",
      "deleted": false,
      "user": d.genUserId, // userId
      "role": role,
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString(),
      "__v": 0,
      imported: imported
    };
  });

  // write report
  await fs.writeFile('report/installation/userPhoneNotCorrect.json', JSON.stringify(userPhoneNotCorrect, null, 2))
  await fs.writeFile('report/installation/userEmailNotCorrect.json', JSON.stringify(userEmailNotCorrect, null, 2))
  await fs.writeFile('report/installation/userNotLinkTeam.json', JSON.stringify(userNotLinkTeam, null, 2))

  // migrate
  const userManagementInsertCount = await userManagementCollection.insertMany(userManagement);
  const teamInsertCount = await teamCollection.insertMany(teamsWithStaffs);
  const staffsInsertCount = await staffsCollection.insertMany(staffs);
  const authUserInsertCount = await authUserCollection.insertMany(authUser);
  const authPermissionInsertCount = await authPermissionCollection.insertMany(authPermission);

  console.timeEnd('migrate installation')
})();

// todo fix map zoneId not correct and takstypegroupIds
