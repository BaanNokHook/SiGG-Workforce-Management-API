const ObjectId = require('mongodb').ObjectID;
const fs = require('fs').promises;
const prompt = require("prompt-sync");

const updateRelationTeam = async (mongoClient, config) => {
  console.time(config.importedFlag)
  
  prompt()(`Are you sure.`);
  
  const reportUpdateTeam = []
  
  const teamDB = await mongoClient.db("4pl-fleet").collection("teams");
  const staffDB = await mongoClient.db("4pl-fleet").collection("staffs");
  
  const teams = await teamDB.find({projectId: ObjectId(config.project.id), code: "OSTV000"}).toArray()
  
  for (const team of teams) {
    const filterStaffs = {
      "projectIds": ObjectId(config.project.id),
      teamIds: team._id
    }
    const staffs = await staffDB.find(filterStaffs).toArray()
    const staffObjIds = staffs.map(d => d._id)
    const staffCodes = staffs.map(d => d.metaData.staffCode)
    
    const staffIds = staffObjIds.map(d => d.toString())
    const teamIds = team.staffIds.map(d => d.toString())
    const diff = staffIds.filter((staffId) => !teamIds.includes(staffId))
    
    let resS
    if (diff.length > 0) {
      console.log(`teamCode: ${team.code} | staffLen: ${staffIds.length} | teamLen: ${team.staffIds.length} | staffDiff:`, diff)
  
      resS = await teamDB.updateOne({code: team.code, projectId: ObjectId(config.project.id)}, {
        $set: {
          staffIds: staffObjIds,
          importUpdated: config.importedFlag
        }
      })
      
      reportUpdateTeam.push({
        teamCode: team.code,
        staffLen: staffObjIds.length,
        teamLen: team.staffIds.length,
        diff: diff,
        staffIds: staffIds,
        staffCodes: staffCodes,
        updateResult: resS.result.nModified
      })
    }
  }
  
  await fs.writeFile(`report/assurance/v6/${config.importedFlag}_updateTeam.json`, JSON.stringify(reportUpdateTeam, null, 2))
  
  console.timeEnd(config.importedFlag)
}

module.exports = updateRelationTeam
