require('module-alias/register');
const MongoClient = require('mongodb').MongoClient;
const mongoConfig = require('@root/config.json').mongodb;
const ObjectId = require('mongodb').ObjectID;
const { RESULTS_PER_PAGE } = require('@root/constants.js');

async function queryDB({ building, hour, minute, days, room, timestamp, page }) {
    const client = await MongoClient.connect(mongoConfig.url);
    const db = client.db(mongoConfig.database)

    try {
        const collection = db.collection(mongoConfig.courses);
        const query = {};

        if (building) {
            query['building'] = building;
        }

        if (room) {
            query['room'] = room;
        }

        if (hour && minute) {
            query['$expr'] = {
                $cond: {
                    if: {
                        $eq: ["$startHour", parseInt(hour)]
                    },
                    then: {
                        $lte: ["$startMinute", parseInt(minute)]
                    },
                    else: {
                        $lt: ["$startHour", parseInt(hour)]
                    }
                }
            }
        }

        if (days && days.length > 0) {
            const dayQuery = []
            for (const day of days) {
                const dayObj = {};
                dayObj[day] = true;
                dayQuery.push(dayObj);
            }
            query['$or'] = dayQuery;
        }
        console.log(JSON.stringify(query));

        if (timestamp) {
            const secondsSinceEpoch = Math.floor(timestamp / 1000)
            console.log(secondsSinceEpoch)
            console.log(secondsSinceEpoch.toString(16) + "0000000000000000")
            const objectId = new ObjectId(secondsSinceEpoch.toString(16) + "0000000000000000");

            query._id = {
                $gte: objectId
            }
        }

        const skip = (page || 0) * RESULTS_PER_PAGE;

        // isn't efficient for large queries because of skip - change later if speed issues
        const res = await collection
            .find(query)
            .skip(skip)
            .limit(RESULTS_PER_PAGE)
            .toArray();
        
        console.log(res.length);
        return res;
    } 
    catch (err) {
        console.log(err);
    }
    finally {
        client.close();
    }
}

// (async function() {
//     await queryDBPromise({
//         building: 'ATL',
//         hour: 8,
//         minute: 32,
//         day: 'Th',
//         room: '0254'
//     });

//     console.log('post');

// })();

module.exports = queryDB;
