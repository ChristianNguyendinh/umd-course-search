const { MongoClient, ObjectId } = require('mongodb');
const { mongodb: MONGO_CONFIG } = require('@root/config.json');
const { RESULTS_PER_PAGE, DEFAULT_PAGE } = require('@root/constants.js');

/**
 * Query the courses DB to find all courses matching criteria defined in the parameter options object.
 * 
 * @param {object} options - parameters to search with 
 * 
 * @returns {object} - object with list of courses found in the 'results' key. // TODO define type with TS when that happens
 */
module.exports = async function(options = {}) {
    let mongoClient;

    try {
        mongoClient = await MongoClient.connect(MONGO_CONFIG.url);
        const db = mongoClient.db(MONGO_CONFIG.database);
        const collection = db.collection(MONGO_CONFIG.courses);

        const query = await buildQueryObject(options);
        const documentsToSkip = (options.page || DEFAULT_PAGE) * RESULTS_PER_PAGE;
        console.log('[info] query: ', query);
        // isn't efficient for large queries because of skip
        // change later if need speed. pagination should be changed too if we do that
        const results = await collection
            .find(query)
            .skip(documentsToSkip)
            .limit(RESULTS_PER_PAGE);

        const resArray = await results.toArray();
        // console logs now until we add a logger
        console.log('[info] number of results: ', resArray.length);

        const returnObject = {
            results: resArray
        };

        const totalMatchingDocuments = await results.count();
        if (totalMatchingDocuments > RESULTS_PER_PAGE || !isNaN(options.page)) {
            const paginationInfo = generatePaginationInfo(options.timestamp, options.page, totalMatchingDocuments);
            Object.assign(returnObject, paginationInfo);
        }

        return returnObject;
    }
    finally {
        if (mongoClient) {
            mongoClient.close();
        }
    }
}

/**
 * Builds a MongoDB query based on the options provided.
 * 
 * @param {object} options - parameters to search with
 * 
 * @returns {object} - object representing MongoDB options
 */
function buildQueryObject({ building, hour, minute, days, room, timestamp }) {
    const query = {};

    // verbose way since mongo doesn't like explicit undefined keys
    building && (query['building'] = building);
    room && (query['room'] = room);

    if (hour && minute) {
        query['$and'] = [
            { $expr: { $cond: {
                if: {
                    $eq: ["$startHour", parseInt(hour)]
                },
                then: {
                    $lte: ["$startMinute", parseInt(minute)]
                },
                else: {
                    $lt: ["$startHour", parseInt(hour)]
                }
            } } },
            { $expr: { $cond: {
                if: {
                    $eq: ["$endhour", parseInt(hour)]
                },
                then: {
                    $gte: ["$endMinute", parseInt(minute)]
                },
                else: {
                    $gt: ["$endHour", parseInt(hour)]
                }
            } } }
        ]
    }

    if (days && days.length > 0) {
        const dayQuery = []
        for (const day of days) {
            // need separate object per field for proper OR ;(
            const dayObj = {};
            dayObj[day] = true;
            dayQuery.push(dayObj);
        }
        query['$or'] = dayQuery;
    }

    if (timestamp) {
        const secondsSinceEpoch = Math.floor(timestamp / 1000)
        // this will actually break if timestamp is set to REALLY far in past...
        const objectId = new ObjectId(secondsSinceEpoch.toString(16) + "0000000000000000");

        query['_id'] = {
            $lte: objectId
        }
    }

    return query;
}

function generatePaginationInfo(oldTimestamp, page, totalMatchingDocuments) {
    // timestamp to avoid pages avoid old pagination requests being corrupted by new data
    const ts = oldTimestamp || (new Date()).getTime();
    const totalPages = Math.ceil(totalMatchingDocuments / RESULTS_PER_PAGE);

    return {
        timestamp: ts,
        page: page || DEFAULT_PAGE,
        totalPages,
        paginated: true,
    };
}
