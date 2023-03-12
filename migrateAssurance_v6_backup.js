const util = require('util');
const exec = util.promisify(require('child_process').exec);

const backupData = async (config) => {
  console.time(config.importedFlag)
  const backups = [
    {
      db: "4pl-user-management",
      collection: "users"
    },
    {
      db: "4pl-fleet",
      collection: "staffs"
    },
    {
      db: "4pl-fleet",
      collection: "teams"
    },
    {
      db: "4pl-authentication",
      collection: "users"
    },
    {
      db: "4pl-authentication",
      collection: "details"
    },
  ]
  
  for (const backup of backups) {
    const db = backup.db
    const collection = backup.collection
    
    const command = `mongodump --uri='${config.mongoDBUri}' --db=${db} --collection=${collection} -o="backup/${config.importedFlag}"`
  
    try {
      const {stdout, stderr} = await exec(command);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
    } catch (e) {
      console.error('error:', e);
    }
  
    console.log('================================')
  }
  
  console.timeEnd(config.importedFlag)
}

module.exports = backupData

