 /**
     * Created by fabian on 01.05.2016.
     */
    var request = require('request');
var cheerio = require('cheerio');

request('http://www.dw.com/en/top-stories/s-9097', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('h2.linkable').each(function(i, element){
            var a = $(this);
            console.log(a.text());
        });
    }
});