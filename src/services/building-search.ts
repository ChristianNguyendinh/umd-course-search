import mongoCollectionConnect from '@services/mongo-collection-connect';
import { Collection } from 'mongodb';

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
export default async () => {
    return await mongoCollectionConnect(MONGO_CONFIG.buildings, async (collection: Collection) => {
        const results = await collection.find({}, { fields: fieldsToInclude });
        const resArray = await results.toArray();

        return {
            results: resArray
        };
    });
};
