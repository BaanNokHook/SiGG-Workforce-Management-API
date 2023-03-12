const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const geographiesScabType = ObjectId('5d77892d87472fa44fd52351');

(async () => {
  const mongoEks = new MongoClient(
    'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
    {
      useNewUrlParser: true,
    }
  );
  await mongoEks.connect();

  const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
  const zoneCollection = await mongoEks.db("4pl-address-and-zoning").collection("geographies");
  const wfmZones = await zoneCollection.find({type: geographiesScabType}).toArray();


  const teams = await teamCollection.find({imported: {"$ne": 'v1'}}).toArray();

  const teamWithZone = teams.map(team => {
    console.log('========');
    const zone = team.zone.map(z => {
      const matchZone = wfmZones.filter(wfmZones => {
        if (z.zoneId.toHexString() === wfmZones._id.toHexString()) {
          console.log(`team: ${team.code}, zoneId: ${wfmZones._id.toHexString()}, zoneName: ${wfmZones.metadata.areaCode}`);
        }
        return wfmZones._id.toHexString() === z.zoneId.toHexString();
      });

      return matchZone;

      return {
        ...z,
        zone: zoning
      };
    });

    return {
      _id: team._id.toHexString(),
      ...team,
      zone: zone
    };
  });


  console.log('debug');

})();
