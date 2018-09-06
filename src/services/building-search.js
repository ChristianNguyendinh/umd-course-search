const { MongoClient } = require('mongodb');
const { mongodb: MONGO_CONFIG } = require('@root/config.json');

const fieldsToInclude = {
    _id: 0,
    id: 1,
    code: 1,
    name: 1
};

/**
 * Temporary for testing.
 * Get list of valid buildings and their properites.
 *
 * @returns {object} - object with list of valid buildings as `results` key
 */
module.exports = async function() {
    const mongoClient = await MongoClient.connect(MONGO_CONFIG.url);
    const db = mongoClient.db(MONGO_CONFIG.database)

    try {
        const collection = db.collection(MONGO_CONFIG.buildings);
        const results = await collection.find({}, { fields: fieldsToInclude });
        const resArray = await results.toArray();

        return {
            results: resArray
        };
    }
    catch (err) {
        console.log(err);
    }
    finally {
        mongoClient.close();
    }
}
