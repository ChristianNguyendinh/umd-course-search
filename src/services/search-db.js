require('module-alias/register');
const MongoClient = require('mongodb').MongoClient;
const mongoConfig = require('@root/config.json').mongodb;

function queryDB(building, hour, minute, day, room) {
    MongoClient.connect(mongoConfig.url, function (err, client) {
        if (err) throw (err);

        const db = client.db(mongoConfig.database);
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

        collection.find(query).toArray(function(err, docs) {
            if (err) return console.log(err);

            console.log(docs);
            client.close();
        });
    });
}

// db.courses.find({building: 'ATL', $expr: { $cond: { if: { $eq: ["$startHour", 8] } }, then: { $lte: ["$startMinute", 32] }, else: { $lt: ["$startHour", 8] } } })

queryDB('ATL', 8, 32, undefined, '0254');
