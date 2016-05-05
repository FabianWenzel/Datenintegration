
var request = require('sync-request');
var xml2js = require('xml2js');
var Twitter = require('twitter');
var fs = require('fs');
var stream = fs.createWriteStream("my_file.txt");

var rssFeeds = [
    "http://www.spiegel.de/schlagzeilen/index.rss",
    "http://www.welt.de/?service=Rss",
    "http://rss.focus.de/fol/XML/rss_folnews.xml",
    "http://rss.sueddeutsche.de/app/service/rss/alles/index.rss?output=rss",
    "http://newsfeed.zeit.de/all"
];

var twitterFeeds = [
    "SPIEGELONLINE",
    "welt",
    "focusonline",
    "SZ",
    "zeitonline"
];

var client = new Twitter({
});



for(var i = 0; i < twitterFeeds.length; i++) {

    // Twitter
    var twitterUid = twitterFeeds[i];

    var params = {screen_name: twitterUid, count:10, trim_user: true};
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            for (var i = 0; i < tweets.length; i++) {
                var tweet = tweets[i];
                console.log(tweet.text);
            }
        }
    });

    // RSS Feed
    var rssLink = rssFeeds[i];
    console.log("start crawling: " + rssLink);
    var rssContent = crawlFeed(rssLink);
    var title = "";
    var textall = "";


    var xmlContent = xml2js.parseString(rssContent, function (err, result) {
        try {
        for (var x = 0; x < result.rss.channel.length; x++) {
            for (var y = 0; y < result.rss.channel[x].title.length; y++) {
                console.log(result.rss.channel[x].title[y]);
            }
            for (var j = 0; j < result.rss.channel[x].item.length && j < 10; j++) {
                var item = result.rss.channel[0].item[j];
              //  console.log(item.title[0].trim());
               // console.log(item.description[0].trim();
               // var lol = item.title[0].trim();

               // lol += (item.title[0].trim()) + item.description[0].trim();
               title += item.title[0].trim() + "\n";

                console.log(item.title[0].trim() +"\n" + "\n");



            }

        }

        } catch(err) {
            console.log(err);
        }

        console.log('Done');
    });

   // textall =+ lol;


}
console.log(title);

// fs.writeFile("\loll.txt", title, function(err) {
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The file was saved!");
// });


stream.once('open', function(fd) {
  stream.write(title+"\n");
  //  stream.write("My second row\n");
  stream.end();
});


function crawlFeed(link) {
    var res = request('GET', link);
    return res.body.toString('utf-8');
}


	var net = require('net');

	var client = net.connect(1011, 'localhost');
 		client.write(title);
      client.end();






