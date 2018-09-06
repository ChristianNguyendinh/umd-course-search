const request = require("request");
const cheerio = require("cheerio");

/**
 * Takes in a semester code (ex. 201801), and scrapes NTST to get the course categories
 * (ex. CMSC or ASTR), currently planned for that semester. Prints out the list to standard
 * out. Newline separated
 * 
 * @param {string} semester - semester code of course categories to get
 */
function scrapeDepartmentIds(semester) {
    if (semester != null) {
        request.get(
            {
                "baseUrl": "https://ntst.umd.edu/",
                "url": "soc/" + semester,
            },
            async (err, res, body) => {
                if (err) return console.log(err);

                const $ = cheerio.load(body);
                const classArray = [];
                const total = $(".prefix-abbrev").length;
                let current = 0;

                // consider bluebird
                await (new Promise(function(resolve, reject) {
                    $(".prefix-abbrev").each(function(i, elem) {
                        classArray.push($(this).text())

                        current++;
                        if (current >= total) {
                            resolve()
                        }
                    });
                }));

                for (var c of classArray) {
                    console.log(c)
                }
            }
        );
    }
}

scrapeDepartmentIds("201801");