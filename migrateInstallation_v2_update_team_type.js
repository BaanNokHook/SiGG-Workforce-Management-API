const xlsx = require("xlsx");
const MongoClient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const fs = require('fs').promises;
var ObjectId = require('mongodb').ObjectID;
const _ = require('lodash')

const installationProjectId = '5f895cb6a009ca2df08315cb';
const imported = 'installation';

(async () => {
  console.time('update team tree')

  const mongoEks = new MongoClient(
      'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
      // 'mongodb://localhost:5502/?authSource=admin',
      {
        useNewUrlParser: true,
      }
  );
  await mongoEks.connect();

  // ## DB INSERT
  // team
  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");

  // ## xlsx
  // team parent
  const teamParentWorkbook = xlsx.readFile('./importFile/installation/raw/Subs_info_set3-raw.xlsx');
  const team_parent_sheet_name_list = teamParentWorkbook.SheetNames;
  let teamParentStructures = xlsx.utils.sheet_to_json(teamParentWorkbook.Sheets[team_parent_sheet_name_list[0]]);

  // team child
  const teamsWorkbook = xlsx.readFile('./importFile/installation/raw/Team_information_set3-raw.xlsx');
  const team_sheet_name_list = teamsWorkbook.SheetNames;
  let teamChildStructures = xlsx.utils.sheet_to_json(teamsWorkbook.Sheets[team_sheet_name_list[0]]);

  const teams = [...teamParentStructures, ...teamChildStructures]

  for (const team of teams) {
    let teamTypeId;
    switch (String(team.TYPE).trim()) {
      case "Company":
        teamTypeId = ObjectId("5fd9e013073b429d95a5ed42")
        break;
      case "Subcontractor Team":
        teamTypeId = ObjectId("5d038e8b3f8d2837ac729d6e")
        break;
      case "Zone Team(FTTO)":
        teamTypeId = ObjectId("5d26eb7be702b4003a2da9ce")
        break;
      case "Fix Team":
        teamTypeId = ObjectId("5fd9e05f073b429d95a5ed43")
        break;
      default:
        throw "ddd"
    }
    const res = await teamCollection.updateOne(
        {imported: imported, code: String(team.TEAM_CODE).trim()},
        {
          $set: {
            teamTypeId: teamTypeId
          }
        }
    )
    console.log('u', res.result.nModified)
  }
  console.timeEnd('update team tree')
})();

// todo fix map zoneId not correct and takstypegroupIds
