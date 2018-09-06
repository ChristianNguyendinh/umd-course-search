require('module-alias/register');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const mongoConfig = require('@root/config.json').mongodb;

/**
 * Takes in a filename containing a list of buildings, and inserts
 * those buildings into a mongoDB collection based on the config file.
 * Expects parameters to be in the JSON format that is provided by
 * UMD terpnav's API.
 * 
 * @param {string} filename - name of file containing building data
 * 
 * @returns {undefined}
 */
function insertBuildings(filename) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) throw(err);

        MongoClient.connect(mongoConfig.url, function (err, client) {
            if (err) throw (err);

            console.log("Connected successfully to server");

            const db = client.db(mongoConfig.database);

            const collection = db.collection(mongoConfig.buildings);

            const json = JSON.parse(data);
            console.log("Total Buildings: ", json.length);

            const formatted = [];
            for (let ele of json) {
                formatted.push({
                    'id': ele['number'],
                    'code': ele['name_short'],
                    'name': ele['name_long']
                });
            }

            // console.log(formatted[1]);

            collection.insertMany(formatted, (err, result) => {
                if (err) return console.log("Error inserting");
                console.log("Number of inserted building documents: ", result.ops.length);

                client.close();
            });
        });
    });
}

const args = process.argv.slice(2);
// for now expect one argument of the class category (ex. CMSC) we want
if (args.length == 1) {
    insertBuildings(args[0]);
} else {
    console.error("Invalid arguments");
    console.error('Usage: node building-process.js <file path>');
}
