 /**
     * Created by fabian on 01.05.2016.
     */



 var request = require('request');
 var cheerio = require('cheerio');
 var mysql      = require('mysql');
 var connection = mysql.createConnection({
     host     : 'localhost',
     user     : 'fabianw',
     password : '',
     database : 'dw'
 });

 connection.connect(function(err) {
     if (err) {
         console.error('error connecting: ' + err.stack);
         return;
     }

     console.log('connected as id ' + connection.threadId);
 });

 var id = 1;

request('http://www.dw.com/en/top-stories/s-9097', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('h2.linkable').each(function(i, element){
            var title = $(this);
            console.log(title.text());
            id = id +1;

            var link = "www.dw.com" + title.parent().attr('href');
            console.log(link);
            var obj = {

               // beitrag_id: id,
                titel: title.text(),
                link: link
            };
            connection.query('INSERT INTO beitrag SET ?', obj, function(err, result) {
                if (err) throw err;
                console.log(' Inserted: ' + title.text());
            });
        });
    }
});

