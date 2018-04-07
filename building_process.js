const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(__dirname + "/secrettest.db");

fs = require('fs')
fs.readFile('./buildings.txt', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    let json = JSON.parse(data);
    console.log(json.length);

    let formatted = [];
    db.serialize(() => {
        for (let ele of json) {
            formatted.push({ 
                'id': ele['number'],
                'code': ele['name_short'], 
                'name': ele['name_long'] 
            });

            db.run("INSERT INTO buildings (id, code, name) VALUES ($1, $2, $3);",
                [
                    ele['number'], ele['name_short'], ele['name_long']
                ]
            );
        }
    });

    console.log(formatted.length);
    console.log(formatted[1]);
});