const MongoClient = require('mongodb').MongoClient;


(async () => {
  console.time('migrate team data structure')

  const mongo = new MongoClient(
    'mongodb://teladmin:teladmin@localhost/?authSource=admin',
    {
      useNewUrlParser: true,
    }
  );
  await mongo.connect();


  const teamCollection = await mongo.db("4pl-fleet").collection("teams");
  const teamParents = await teamCollection.find({parentId: null}).toArray();


  const recursive = async (teams, path) => {
    if (teams.length === 0) return

    const setPath = path.replace(/,,/g, ',')
    const res = await teamCollection.updateMany({_id: {$in: teams.map(d => d._id)}}, {$set: {teamPath: setPath}})

    for (const team of teams) {
      const teamChildren = await teamCollection.find({parentId: team._id}).toArray();
      await recursive(teamChildren, `${path},${team._id.toString()},`)
    }
  }

  // start
  await recursive(teamParents, '')


  console.timeEnd('migrate team data structure')
})()