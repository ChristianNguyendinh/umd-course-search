import { MongoClient, Collection } from 'mongodb';

const { mongodb: MONGO_CONFIG } = require('@root/config.json');

/**
 * Function for connecting to mongoDB database. Passes a MongoClient collection object correponsing to the parameter
 * collection name to a callback after connecting. Wraps callback in error checking functionality.
 */
export default async (collectionName: string, callback: (collection: Collection) => any) => {
    let mongoClient: MongoClient;

    try {
        mongoClient = await MongoClient.connect(MONGO_CONFIG.url);
        const db = mongoClient.db(MONGO_CONFIG.database);
        const collection = db.collection(collectionName);

        return await callback(collection);
    } finally {
        if (mongoClient) {
            mongoClient.close();
        }
    }
};
