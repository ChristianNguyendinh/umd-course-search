const request = require("request");
const cheerio = require("cheerio");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoConfig = require('./config.json').mongodb;

/**
 * Helper function that when you actually think about it, is pretty useless and overthought
 */
function wait() {
    var i = 0;
    /*
    We want to run something on all elements of a function, but have it wait between each one.
    A raw setTimeout function will all be kicked off relatively at the same time by a for loop,
    so they will all execute at relatively the same time.
    So, we return a closure and every time the inner function is called, it waits by one more second.
    Thus with all functions being kicked off around the same time, the first would wait 1 sec, second
    2 secs, etc... making a one sec different between each call
    */
    return function(semester, cid) {
        i += 1;
        setTimeout(() => { 
            console.log("Getting info for: " + cid);
            getInfo(semester, cid);
        }, 3000 * i);
    }
}

/**
 * Takes in a semester code (ex. 201801), and scrapes NTST to get the course categories
 * (ex. CMSC or ASTR), currently planned for that semester. Prints out the list to standard
 * out. Newline separated
 * 
 * @param {string} semester - semester code of course categories to get
 */
function getCategories(semester) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester,
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var classArray = [];
            var total = $(".prefix-abbrev").length;
            var current = 0;

            var p = new Promise(function(resolve, reject) {
                $(".prefix-abbrev").each(function(i, elem) {
                    classArray.push($(this).text())

                    current++;
                    if (current >= total) {
                        resolve()
                    }
                });
            }).then(function(success) {
                for (var c of classArray) {
                    console.log(c)
                }
                
                // getClassids(semester, classArray)

            }); 
        }
    );
}

/**
 * Gets all courses for the given course category in the given semester, then
 * sets off a ~1 second delay between calling getInfo on each course.
 * 
 * @param {*} semester - semester code
 * @param {*} category - course category
 */
function getClassids(semester, category) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester + "/" + category,
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var courses = [];
            var total = $(".course-id").length;
            var current = 0;

            var p = new Promise(function(resolve, reject) {
                $(".course-id").each(function(i, elem) {
                    courses.push($(this).text())

                    current++;
                    if (current >= total) {
                        resolve()
                    }
                });
            }).then(function(success) {
                var delay = wait();

                for (var c of courses) {
                    delay(semester, c);
                }

            }); 
        }
    );
}

/**
 * Takes a given course for a given semester and sends a query to get the
 * sections for that course. Then formats those sections into an array of
 * objects containing section name, building, times, etc. Calls parseInfo 
 * on the list of sections.
 * 
 * @param {*} semester 
 * @param {*} classid
 */
function getInfo(semester, classid) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester + "/sections?courseIds=" + classid
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var sectionArray = [];
            var total = $(".section").length;
            var current = 0;
            console.log("soc/" + semester + "/sections?courseIds=" + classid)

            var p = new Promise(function(resolve, reject) {
                $(".section").each(function(i, elem) {
                    var name = $(this).find(".section-id").text().trim();

                    $(this).find(".class-days-container").find(".row").each(function() {
                        // we really need to find a different library
                        if ($(this).find(".building-code").text() == "") {
                            console.log("skipping ", classid, "'s section: ", name);
                            return;
                        }

                        var building = $(this).find(".building-code").text().trim();
                        var room = $(this).find(".class-room").text().trim();//.replace("ONLINE", "");
                        var days = $(this).find(".section-days").text().trim()
                        var stime = $(this).find(".class-start-time").text().trim()
                        var etime = $(this).find(".class-end-time").text().trim()

                        if (building != "") {
                            sectionArray.push({ 
                                name : name,
                                building : building,
                                room : room,
                                days : days,
                                start : stime,
                                end : etime
                            })
                        }
                    });

                    current++;
                    if (current >= total) {
                        resolve()
                    }
                });
            }).then(function(success) {
                // for (var c of sectionArray) {
                //     console.log(c)
                // }
                if (sectionArray.length > 0) {
                    parseInfo(classid, sectionArray);
                } else {
                    console.log("skipping course: ", classid);
                }
            }); 
        }
    );

}

/* example section object.
{ name: '0103',
  building: 'PHY',
  room: '1412',
  days: 'W',
  start: '9:00am',
  end: '9:50am' }
{ name: '0103',
  building: 'ESJ',
  room: 'B0320',
  days: 'MWF',
  start: '2:00pm',
  end: '2:50pm' }
...
*/

/**
 * Takes in a course id and list of section objects for that course. Formats each
 * section object for insertion into the databaes, calls storeInfo on the list of
 * sections.
 * 
 * @param {*} classid 
 * @param {*} sectionArr 
 */
function parseInfo(classid, sectionArr) {
    var parsedArr = [];

    console.log("Parsing sections for: ", classid);

    for (classtime of sectionArr) {
        var m = classtime['days'].includes("M").toString();
        var tu = classtime['days'].includes("Tu").toString();
        var w = classtime['days'].includes("W").toString();
        var th = classtime['days'].includes("Th").toString();
        var f = classtime['days'].includes("F").toString();

        parsedArr.push({
            course : classid,
            section : classtime['name'],
            room : classtime['building'] + classtime['room'],
            M : m,
            Tu : tu,
            W : w,
            Th : th,
            F : f,
            start : classtime['start'],
            end : classtime['end'],
        });
    }

    // for (var c of parsedArr) {
    //     console.log(c);
    // }

    storeInfo(parsedArr);
}

/**
 * Takes in an array of formatted section objects, stores the section objects
 * in mongoDB based on the config file.
 * 
 * @param {*} parsedArr 
 */
function storeInfo(parsedArr) {
    // this is bad
    MongoClient.connect(mongoConfig.url, function (err, client) {
        if (err) throw (err);

        const db = client.db(mongoConfig.database);
        const collection = db.collection(mongoConfig.courses);

        collection.insertMany(parsedArr, function (err, result) {
            if (err) return console.log("Error inserting: ", err, "\n", JSON.stringify(parsedArr));

            client.close();
        });
    });
}

// getCategories > getClassids (for each) > getInfo > parseInfo > storeInfo
// BMGT340, ASTR230, EDCP108M
// getClassids("201801", "CMSC");

var args = process.argv.slice(2);
// for now expect one argument of the class category (ex. CMSC) we want
if (args.length == 1) {
    getClassids("201808", args[0]);
} else {
    console.error("Invalid arguments");
}