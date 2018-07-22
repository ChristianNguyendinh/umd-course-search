require('module-alias/register');
const MongoClient = require('mongodb').MongoClient;
const mongoConfig = require('@root/config.json').mongodb;

async function queryDB(filters) {
    const { building, hour, minute, day, room } = filters;

    const client = await MongoClient.connect(mongoConfig.url);
    const db = await client.db(mongoConfig.database)

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
                        $eq: ["$startHour", hour]
                    },
                    then: {
                        $lte: ["$startMinute", minute]
                    },
                    else: {
                        $lt: ["$startHour", hour]
                    }
                }
            }
        }

        // validate day or assume validation done? worst case empty query
        if (day) {
            query[day] = true;
        }
        console.log(query);

        const res = await collection.find(query).toArray();
        
        console.log(res);
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
