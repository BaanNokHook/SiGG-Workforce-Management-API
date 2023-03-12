const MongoClient = require('mongodb').MongoClient;
const csv = require('csvtojson')
var ObjectId = require('mongodb').ObjectID;

const assuranceProjectId = '5cf0ad79b603c7605955bc7f';

const updateTeam = async (name) => {
    console.time(`update team`)

    const mongoEks = new MongoClient(
        // prod
        'mongodb+srv://teladmin:a9bbafb75a97d316703678337396d97a@general-purpose-production-21cur.mongodb.net/?authSource=admin',
        // staging
        // 'mongodb://teladmin:teladmin@mongodb-mongodb-replicaset-0.mongo.datastore.staging.tel.internal/?authSource=admin',
        // pt
        // 'mongodb+srv://devsupport2:BjsH43eLzSP5djwT@drivs-loadtest.21cur.mongodb.net/?authSource=admin',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );
    await mongoEks.connect();


    const teamCollection = await mongoEks.db("4pl-fleet").collection("teams");
    const staffsCollection = await mongoEks.db("4pl-fleet").collection("staffs");

    const teams = await teamCollection.find({projectId: ObjectId(assuranceProjectId)}).toArray()

    for (const [i, team] of teams.entries()) {
        const staffs = await staffsCollection.find({
            "projectIds": ObjectId(assuranceProjectId),
            teamIds: team._id
        }).toArray()
        const staffIds = staffs.map(d => d._id)

        // # DEBUG
        const strStaffIds = staffIds.map(d => d.toString())
        const strTeamIds = team.staffIds.map(d => d.toString())
        const diff = strTeamIds.filter(x => !strStaffIds.includes(x))

        let resS
        if (diff.length > 0) {
            console.log(`At: ${i} | teamCode: ${team.code} | staffLen: ${staffIds.length} | teamLen: ${team.staffIds.length} | staffDiff:`, diff)

            resS = await teamCollection.updateOne({code: team.code, projectId: ObjectId(assuranceProjectId)}, {
                $set: {
                    staffIds: staffIds,
                    importUpdated: name
                }
            })
            console.log(resS.result.nModified)
        }
    }

    console.timeEnd(`update team`)
}

(async () => {
    // await importAssurance('Outsource')
    // await importAssurance('RNSO-BMA')
    // await importAssurance('RNSO-UPC1')
    try {
        await updateTeam('assurance-BMA-2021-01-24-sync-team')
    } catch (e) {
        console.log(e)
    }
})()

// pt bma 2021-01-21

// At: 90 | teamCode: BMA_III_NORTH_EAST | staffLen: 23 | teamLen: 23 | staffDiff: [ '60014b70bcb1a2d5bbb0ad09' ]
// 1
// At: 223 | teamCode: BMA_IV_SOUTH_EAST | staffLen: 10 | teamLen: 10 | staffDiff: [
//     '60014b70bcb1a2d5bbb0ad9c',
//     '60014b70bcb1a2d5bbb0ad9e',
//     '60014b70bcb1a2d5bbb0adb0',
//     '60014b70bcb1a2d5bbb0adb3',
//     '60014b70bcb1a2d5bbb0adb5',
//     '60014b70bcb1a2d5bbb0adb8',
//     '60014b70bcb1a2d5bbb0adbb',
//     '60014b70bcb1a2d5bbb0adbd',
//     '60014b70bcb1a2d5bbb0adc0'
// ]
// 1

// sync team pt test before prod 2021-01-22
// At: 89 | teamCode: BMA_III_NORTH_EAST | staffLen: 24 | teamLen: 24 | staffDiff: [ '600a4f2f364d5335df1e70e8', '600a4f2f364d5335df1e70ea' ]
// 1


// prod 2021-01-24