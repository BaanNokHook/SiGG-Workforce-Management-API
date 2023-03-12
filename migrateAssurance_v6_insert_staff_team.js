const prompt = require("prompt-sync");
const passwordHash = require("password-hash");
const csv = require("csvtojson");

const fs = require('fs').promises;
const ObjectId = require('mongodb').ObjectID;

function isValidateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).trim().toLowerCase());
}

const importStaffAndTeam = async (mongoClient, config, fileName = '') => {
  console.time(config.importedFlag)
  
  let reportTeamNotFoundAreaCode = []
  let reportNotFoundSkill = []
  let reportStaffPhoneNotCorrect = []
  let reportStaffEmailNotCorrect = []
  let reportTeamDuplicate = []
  let reportStaffDuplicate = []
  let reportStaffNotLinkTeam = []
  let reportNotFoundParentId = []
  
  const taskTypeGroupsCollection = await mongoClient.db("4pl-tms").collection("tasktypegroups");
  const zoneCollection = await mongoClient.db("4pl-address-and-zoning").collection("geographies");
  const skillCollection = await mongoClient.db("4pl-authentication").collection("skills");
  const teamCollection = await mongoClient.db("4pl-fleet").collection("teams");
  const userManagementCollection = await mongoClient.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoClient.db("4pl-fleet").collection("staffs");
  const authUserCollection = await mongoClient.db("4pl-authentication").collection("users");
  const authPermissionCollection = await mongoClient.db("4pl-authentication").collection("details");
  
  let teamStructures = await csv().fromFile(`./importFile/assurance/v2/export-TEAM_Structure-${fileName}.csv`);
  let teamAreaCodes = await csv().fromFile(`./importFile/assurance/v2/export-TeamServiceArea-${fileName}.csv`);
  let userStructures = await csv().fromFile(`./importFile/assurance/v2/export-TEAM_Member-${fileName}.csv`);
  let userSkillStructures = await csv().fromFile(`./importFile/assurance/v2/export-UserSkill-${fileName}.csv`);
  
  const wfmTaskTypeGroups = await taskTypeGroupsCollection.find({}).toArray();
  const wfmSkills = await skillCollection.find({}).toArray();
  const teamsFromDB = await teamCollection.find({projectId: ObjectId(config.project.id)}).toArray()
  
  // check duplicate from installation
  // const userFromDB = await userManagementCollection.find({'project.id': {$in: [config.project.id, "5f895cb6a009ca2df08315cb"]}}).toArray();
  const userFromDB = await userManagementCollection.find({'project.id': {$in: [config.project.id]}}).toArray();
  
  let teamUnique = teamStructures
    .filter((teamStructure) => {
      const found = teamsFromDB.filter(teamDB => teamDB.code === String(teamStructure.TEAM_CODE).trim())
      
      if (found.length === 0) return true
      
      reportTeamDuplicate.push(found[0].code)
      return false
    })
  
  const teamWithZone = []
  for (const teamStructure of teamUnique) {
    const zoneRaw = teamAreaCodes.filter(teamAreaCode => String(teamAreaCode.TEAM_CODE).trim() === String(teamStructure.TEAM_CODE))
    
    const promiseZoneData = zoneRaw.map(async (teamAreaCode2) => {
      const toZone = wfmTaskTypeGroups
        .filter(taskTypeGroup => taskTypeGroup.name === teamAreaCode2.CATALOG_NAME.trim())
        .map(d => d._id);
      
      const zoneFromDB = await zoneCollection
        .findOne({
          'metadata.isFromCustomer': false,
          'metadata.areaCode': String(teamAreaCode2.AREA_CODE).trim()
        })
      
      if (!zoneFromDB) {
        reportTeamNotFoundAreaCode.push(teamAreaCode2.AREA_CODE)
        return undefined
      }
      
      return {
        zoneId: zoneFromDB._id,
        areaCode: String(teamAreaCode2.AREA_CODE).trim(),
        taskTypeGroupIds: toZone,
        shiftType: "All day",
        bufferType: "Point to point",
        _id: new ObjectId(),
        buffer: {
          hours: 0,
          minutes: 0
        }
      }
    })
    const zoneData = await Promise.all(promiseZoneData)
    
    const zone = zoneData.filter(d => d !== undefined)
    teamWithZone.push({
      _id: new ObjectId(),
      metadata: {qRun: {config: []}},
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
      projectId: ObjectId(config.project.id), // hardcode
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deleted: false,
      "__v": 0,
      imported: config.importedFlag,
    })
  }
  
  let teamFullFil = teamWithZone.map((d, index, currTeams) => {
    let parentId = null;
    
    if (d.parentId !== "0000-00") {
      const findOnFile = currTeams.filter(currTeam => d.parentId === currTeam.code)
      if (findOnFile.length > 0) {
        return {
          ...d,
          parentId: findOnFile[0]._id
        }
      }
      
      const findOnDB = teamsFromDB.filter(teamDB => teamDB.code === d.parentId)
      if (findOnDB.length > 0) {
        return {
          ...d,
          parentId: findOnDB[0]._id
        }
      }
      
      
      reportNotFoundParentId.push(d.code)
      return {
        ...d,
        parentId: "NOT_FOUND_PARENT_ID"
      }
    }
    
    return {
      ...d,
      parentId: parentId
    };
  });
  
  teamFullFil = teamFullFil.filter(d => d.parentId !== "NOT_FOUND_PARENT_ID")
  
  const reportStaffMapTeamInDB = []
  const baseUsers = userStructures
    .filter((userStructures) => {
      const found = userFromDB.filter(userDB => {
        return userDB.employeeCode === String(userStructures.USER_CODE).trim().toUpperCase()
      })
      
      if (found.length === 0) return true
      
      reportStaffDuplicate.push(found[0].employeeCode)
      return false
    })
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
      let teamId = teamFullFil.filter(team => team.code === teamCode);
      
      // not found team in import file
      if (teamId[0] === undefined) {
        teamId = teamsFromDB.filter(team => team.code === teamCode);
        reportStaffMapTeamInDB.push({
          userCode: userStructure['USER_CODE'],
          teamCode: userStructure['TEAM_CODE']
        })
        if (teamId.length === 0) {
          reportStaffNotLinkTeam.push(teamCode)
        }
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
        reportStaffPhoneNotCorrect.push(userStructure)
        phone = '9999999999'
      }
      if (!isValidateEmail(userStructure['E_MAIL'])) {
        reportStaffEmailNotCorrect.push(userStructure)
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
        teamId: teamId[0]?._id || "",
        teamName: teamId[0]?.name || "",
        skills: skillIds,
        password: passwordHash.generate(phone || userStructure['PHONE_NO'].trim()),
        citizenId: String(Math.floor(Math.random() * 10000000000000)),
        location: {
          lat: lat,
          long: long
        }
      };
    });
  
  const teamsWithStaffs = teamFullFil.map(team => {
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
        id: config.project.id
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
      imported: config.importedFlag
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
        ObjectId(config.project.id)
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
      imported: config.importedFlag
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
      imported: config.importedFlag
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
      imported: config.importedFlag
    };
  });
  
  reportStaffNotLinkTeam = [...new Set(reportStaffNotLinkTeam)]
  reportNotFoundSkill = [...new Set(reportNotFoundSkill)];
  reportTeamNotFoundAreaCode = [...new Set(reportTeamNotFoundAreaCode)];
  
  // write report
  const summaryText = `team len: ${teamsWithStaffs.length} | staff len: ${userManagement.length}`
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_teamNotFoundAreaCode.json`, JSON.stringify(reportTeamNotFoundAreaCode, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_teamDuplicate.json`, JSON.stringify(reportTeamDuplicate, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_teamNotFoundParentTeam.json`, JSON.stringify(reportNotFoundParentId, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffNotFoundSkill.json`, JSON.stringify(reportNotFoundSkill, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffPhoneNotCorrect.json`, JSON.stringify(reportStaffPhoneNotCorrect, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffEmailNotCorrect.json`, JSON.stringify(reportStaffEmailNotCorrect, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffDuplicate.json`, JSON.stringify(reportStaffDuplicate, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffMapTeamInDB.json`, JSON.stringify(reportStaffMapTeamInDB, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_staffNotLinkTeam.json`, JSON.stringify(reportStaffNotLinkTeam, null, 2))
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_summary.text`, summaryText)
  
  prompt()(`Please check the report. | ${summaryText}`);
  await teamCollection.insertMany(teamsWithStaffs);
  await userManagementCollection.insertMany(userManagement);
  await staffsCollection.insertMany(staffs);
  await authUserCollection.insertMany(authUser);
  await authPermissionCollection.insertMany(authPermission);
  
  console.timeEnd(config.importedFlag)
}

module.exports = importStaffAndTeam