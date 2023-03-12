const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
var ObjectId = require('mongodb').ObjectID;
const _ = require('lodash')

const installationProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'installation-load-test-team-2021-01-05';

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

(async () => {
  console.time('migrate installation')

  const mongoEks = new MongoClient(
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
  // team1
  const teamsWorkbook1 = xlsx.readFile('./importFile/installation/Set3_05012021/20210105-Zone.xls');
  const team_sheet_name_list1 = teamsWorkbook1.SheetNames;
  let teamStructures1 = xlsx.utils.sheet_to_json(teamsWorkbook1.Sheets[team_sheet_name_list1[0]]);

  // team2
  const teamsWorkbook2 = xlsx.readFile('./importFile/installation/Set3_05012021/20210105-Subcontractor.xls');
  const team_sheet_name_list2 = teamsWorkbook2.SheetNames;
  let teamStructures2 = xlsx.utils.sheet_to_json(teamsWorkbook2.Sheets[team_sheet_name_list2[0]]);

  // user
  const userWorkbook = xlsx.readFile('./importFile/installation/Set3_05012021/20210105-Staff_Info.xls');
  const userWorkbook_sheet_name_list = userWorkbook.SheetNames;
  let userStructures = xlsx.utils.sheet_to_json(userWorkbook.Sheets[userWorkbook_sheet_name_list[0]]);

  let userPhoneNotCorrect = []
  let userEmailNotCorrect = []
  let userNotLinkTeam = []

  const team11 = teamStructures1
      .filter((teamStructure) => teamStructure["TEXT"] !== undefined || teamStructure["ID_IN_UAT"] !== undefined || teamStructure["TEXT"] !== undefined)
      .map((teamStructure) => {
        let teamName = String(teamStructure["TEXT"]).trim()

        return {
          _id: new ObjectId(),
          metadata: {qRun: {config: []}},
          staffIds: [],
          name: teamName,
          code: String(teamStructure["ID_IN_UAT"]),
          parentId: teamStructure["PARENT_ID"] ? String(teamStructure["PARENT_ID"]).trim() : null,
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
          pilotLocation: typeof teamStructure.PILOT_LOCATION === "string" ? teamStructure?.PILOT_LOCATION.trim().split(',').map(d => Number(d)) : []
        };
      })
      .map((d, index, currTeams) => {
        let parentId = null;

        // if (d.parentId === "180") {
        //   return {
        //     ...d,
        //     parentId: null
        //   };
        // }

        if (d.parentId !== null) {
          parentId = currTeams.filter(currTeam => d.parentId === currTeam.code)[0]._id;
        }

        return {
          ...d,
          parentId: parentId
        };
      });

  const team22 = teamStructures2
      .filter((teamStructure) => teamStructure["TEXT"] !== undefined || teamStructure["ID_IN_UAT"] !== undefined || teamStructure["TEXT"] !== undefined)
      .map((teamStructure) => {
        let teamName = String(teamStructure["TEXT"]).trim()

        // switch (String(teamStructure.ORGANIZATION_TYPE).trim()) {
        //   case "COMPANY":
        //   case"Company":
        //     teamName = `${teamName} - ${String(teamStructure["ID_IN_UAT"])}`
        //     break;
        //   case "TEAM":
        //     break;
        //   case "ZONE TEAM":
        //     break;
        //   default:
        //     throw `${teamStructure.ORGANIZATION_TYPE} not found`
        // }

        return {
          _id: new ObjectId(),
          metadata: {qRun: {config: []}},
          staffIds: [],
          name: teamName,
          code: String(teamStructure["ID_IN_UAT"]),
          parentId: teamStructure["PARENT_ID"] ? String(teamStructure["PARENT_ID"]).trim() : null,
          contactPerson: "",
          telephone: "",
          description: "",
          zone: [],
          teamTypeId: ObjectId("5d038e8b3f8d2837ac729d6e"), // hardcode
          companyId: ObjectId("5cee7a9bfc47036f05b13847"), // hardcode
          projectId: ObjectId(installationProjectId), // hardcode
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          deleted: false,
          "__v": 0,
          imported: imported,
          pilotLocation: typeof teamStructure.PILOT_LOCATION === "string" ? teamStructure?.PILOT_LOCATION.trim().split(',').map(d => Number(d)) : []
        };
      })
      .map((d, index, currTeams) => {
        let parentId = null;
        if (d.parentId !== null) {
          parentId = currTeams.filter(currTeam => d.parentId === currTeam.code)[0]._id;
        }
        return {
          ...d,
          parentId: parentId
        };
      });

  let teamsFromFile = [...team11, ...team22]

  const baseUsers = userStructures
      .map(userStructure => {
        const teamCode = String(userStructure['TEAM_CODE']).trim()
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
        if (nameSplitLen === 1) {
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
        if (nameSplitLen > 3) {
          firstname = userStructure['USER_NAME'].trim()
          lastname = ''
        }

        // phone, email
        let phone, email
        phone = String(userStructure['CONTACT_NO']).replace(/-/g, '').trim()
        if (phone === undefined || phone.length < 9) {
          userPhoneNotCorrect.push({...userStructure, CONTACT_NO: phone})
          phone = '9999999999'
        }

        email = String(userStructure['EMAIL']).trim().replace(/\,|\<|\>|/g, "")
        if (!isValidateEmail(email)) {
          userEmailNotCorrect.push({...userStructure, EMAIL: email})
          email = 'dump@dump.com'
        }

        // let lat = Number(userStructure['WORK_LATITUDE'])
        // let long = Number(userStructure['WORK_LONGITUDE'])
        // if (isNaN(Number(userStructure['WORK_LATITUDE'])) === true || isNaN(Number(userStructure['WORK_LONGITUDE'])) === true) {

        let lat = 13.68429
        let long = 100.61095
        if (teamId[0] !== undefined && teamId[0].pilotLocation?.length === 2) {
          lat = teamId[0].pilotLocation[0]
          long = teamId[0].pilotLocation[1]
        }

        return {
          genUserId: new ObjectId(),
          genStaffId: new ObjectId(),
          userCode: userStructure['USER_CODE'].trim(),
          name: userStructure['USER_NAME'].trim(),
          firstname: firstname,
          lastname: lastname,
          phone: phone,
          email: email,
          teamCode: teamCode,
          teamId: teamId[0]._id,
          teamName: teamId[0].name,
          isRootTeam: teamId[0].parentId === null ? true : false,
          skills: [],
          password: passwordHash.generate(phone),
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

    delete team.pilotLocation

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
