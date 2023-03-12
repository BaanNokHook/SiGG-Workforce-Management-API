const csv = require('csvtojson')
const ObjectId = require('mongodb').ObjectID;
const prompt = require("prompt-sync");
const fs = require('fs').promises;

const addRole = async (mongoClient, config, roles) => {
  console.time(config.importedFlag)
  
  prompt()(`Are you sure to addRole.`);
  
  const authUserDB = await mongoClient.db("4pl-authentication").collection("users");
  const userDB = await mongoClient.db("4pl-user-management").collection("users");
  const authPermissionDB = await mongoClient.db("4pl-authentication").collection("details");
  
  const insertAuthPermission = []
  const reportDuplicateUserOnInstallationAndAssurance = []
  
  const roleStructures = await csv().fromFile(`./importFile/assurance/v5/BMA/PNI-Table 1.csv`);
  
  for (const role of roles) {
    for (const roleStructure of roleStructures) {
      const userCode = `${roleStructure['USER_CODE'].toString()}_R`
    
      // Update on 4pl-user-management/users
      const user = await userDB.findOne({
        employeeCode: userCode,
        "project.id": config.project.id
      })

      if (!user) {
        continue
      }
      if (user.roles.filter(d => d.name === role.name).length > 0) {
        continue
      }

      const roles = user.roles
      roles.push({_id: role.id, name: role.name})

      await userDB.updateOne({
          employeeCode: userCode,
          "project.id": config.project.id
        }, {
          $set: {
            roles: roles,
            importUpdated: config.importedFlag
          }
        }
      )
    
      // Insert on 4pl-auth/detail
      const authUser = await authUserDB.find({username: userCode}).toArray()
      if (authUser.length > 1) {
        reportDuplicateUserOnInstallationAndAssurance.push(userCode)
        continue
      }
      if (authUser.length === 0) {
        continue
      }
    
      const duplicate = await authPermissionDB.findOne({
        user: authUser[0]._id, role: ObjectId(role.id)
      })
      if (!duplicate) {
        insertAuthPermission.push({
          "_id": new ObjectId(),
          "startDate": null,
          "expireDate": null,
          "inviteMessage": "Welcome",
          "deleted": false,
          "user": authUser[0]._id, // userId
          "role": ObjectId(role.id),
          "createdAt": new Date().toISOString(),
          "updatedAt": new Date().toISOString(),
          "__v": 0,
          imported: config.importedFlag
        })
      }
    }
  }
  
  let authPermissionInsertCount
  if (insertAuthPermission.length > 0) {
    authPermissionInsertCount = await authPermissionDB.insertMany(insertAuthPermission);
  } else {
    console.log("not insert")
  }
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_duplicateUserRoleOnAssAndInstall.json`, JSON.stringify(reportDuplicateUserOnInstallationAndAssurance, null, 2))
  
  console.timeEnd(config.importedFlag)
}

module.exports = addRole
