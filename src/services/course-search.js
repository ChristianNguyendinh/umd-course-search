require('module-alias/register');
const MongoClient = require('mongodb').MongoClient;
const mongoConfig = require('@root/config.json').mongodb;

async function queryDB(filters, resolve, reject) {
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
        resolve(res);
    } 
    catch (err) {
        console.log(err);
        reject();
    }
    finally {
        client.close();
    }
}

// db.courses.find({building: 'ATL', $expr: { $cond: { if: { $eq: ["$startHour", 8] } }, then: { $lte: ["$startMinute", 32] }, else: { $lt: ["$startHour", 8] } } })


function queryDBPromise(filters) {
    return new Promise(function(res, rej) {
        queryDB(filters, res, rej);
    });
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

module.exports = queryDBPromise;
