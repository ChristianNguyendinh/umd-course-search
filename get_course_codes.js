const request = require("request");
const cheerio = require("cheerio");

function getCategories(semester) {
    if (semester != null) {
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
}

getCategories("201801");