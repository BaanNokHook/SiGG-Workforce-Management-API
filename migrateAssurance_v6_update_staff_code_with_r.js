const prompt = require("prompt-sync");
const csv = require('csvtojson')
const ObjectId = require('mongodb').ObjectID;

const updateStaffCodeWithR = async (mongoClient, config) => {
  console.time(config.importedFlag)
  
  prompt()(`Are you sure.`);
  const duplicateStaffAssInstalls = await csv().fromFile(`./importFile/assurance/v5/BMA/PNI-Table 1.csv`);
  
  const userManagementCollection = await mongoClient.db("4pl-user-management").collection("users");
  const staffsCollection = await mongoClient.db("4pl-fleet").collection("staffs");
  const authUserCollection = await mongoClient.db("4pl-authentication").collection("users");
  
  for (const duplicateStaffAssInstall of duplicateStaffAssInstalls) {
    const userCode = duplicateStaffAssInstall['USER_CODE'].toString()
    const userCodeWithR = `${userCode}_R`
    
    // user-management
    // employeeCode
    await userManagementCollection.updateOne({
        employeeCode: userCode,
        "project.id": config.project.id
      }, {
        $set: {
          employeeCode: userCodeWithR,
          importUpdated: config.importedFlag
        }
      }
    )
    
    // fleet-staff
    // metaData.staffCode
    await staffsCollection.updateOne({
        "metaData.staffCode": userCode,
        "projectIds": ObjectId(config.project.id)
      }, {
        $set: {
          "metaData.staffCode": userCodeWithR,
          importUpdated: config.importedFlag
        }
      }
    )
    
    // auth-user
    // username
    await authUserCollection.updateOne({
        "username": userCode,
        "imported": {$regex: /ass/, $options:"i"}
      }, {
        $set: {
          "username": userCodeWithR,
          importUpdated: config.importedFlag
        }
      }
    )
  }
  
  console.timeEnd(config.importedFlag)
}

module.exports = updateStaffCodeWithR
