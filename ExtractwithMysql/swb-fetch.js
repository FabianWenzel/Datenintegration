/**
 * Created by fabian on 24.04.2016.
 */

var request = require('request');

var ppnsList = require("./ppnlist.json");

var delay = 1;

var ppnIndex = 0;
var hasMorePPNs = function () {
    return ppnIndex < ppnsList.length;
}
var withNextPPN = function (callback) {
    var thisPPN = ppnsList[ppnIndex++];
    setTimeout(function () {
        callback(thisPPN)
    }, delay);
}
var fs = require('fs');
var csvrow = require('csvrow');

function writeToFile(filename, data) {
    var err = fs.appendFileSync(filename, data + "\n");
    if (err) {
        console.log("Error writing to file " + filename + "!");
        throw err;
    }
}

function resetFiles() {
    fs.writeFileSync("exemplars.json", "");
    fs.writeFileSync("error.log", "");
}


function output(data) {
    writeToFile("exemplars.json", data);
}

function error(data) {
    writeToFile("error.log", data);
}

resetFiles();

fs.readFile('Liste_PPN-ExNr_HSHN-libre.csv', 'utf8', function (err,inhalt) {
    if (err) {
        return console.log(err);
    }
    var lines = inhalt.split(/\r?\n/);
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        if (i==0) continue;
        var line = lines[i];
        var tokens = csvrow.parse(line);
        if (tokens.length!=5) {
            error("Komische Zeile (" + (i+1) + "): " + line);
        } else {
            var ppn = tokens[0];
            while (ppn.length<9) {
                ppn = "0" + ppn;
            }
            // "0".repeat(9-ppn.length) + ppn
            var exemplar = {
                ppn: ppn,
                exemplar: tokens[1],
                signatur: tokens[2],
                barcode: tokens[3],
                sigel: tokens[4],
                sourceline: i+1
            };
            result.push(exemplar);
        }
    }

    output(JSON.stringify(result, null, 2));


    console.log("Anzahl Zeilen: " + lines.length)
});

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/dataintegration';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // do some work here with the database.

        // Get the documents collection
        var collection = db.collection('swb');

        var count = 0;
        var processPPN = function processPPN(ppn) {
            collection.findOne({
                "_id" : ppn
            }, function (err, res) {
                count++;
                if (!res) {
                    var swburl = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22" + ppn + "%22&version=1.1&operation=searchRetrieve&stylesheet=http%3A%2F%2Fswb.bsz-bw.de%2Fsru%2F%3Fxsl%3DsearchRetrieveResponse&recordSchema=marc21&maximumRecords=1&startRecord=1&recordPacking=xml&sortKeys=none&x-info-5-mg-requestGroupings=none";
                    request(swburl, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var title1 = {
                                "_id" : ppn,
                                "xml" : body
                            };
                            console.log(count + " / " + ppn + ": FETCHED");
                            collection.insert(title1, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Inserted ' + ppn);
                                    if (hasMorePPNs()) {
                                        withNextPPN(processPPN);
                                    } else {
                                        console.log("No more PPNS.")
                                    }

                                }
                            });
                        } else {
                            console.log("Error: " + JSON.stringify(error) + " / Response: " + JSON.stringify(response));
                            console.log("Resuming in 10 seconds...");
                            ppnsList.push(ppn);
                            setTimeout(function() {
                                if (hasMorePPNs()) {
                                    withNextPPN(processPPN);
                                } else {
                                    console.log("No more PPNS.")
                                }
                            }, 10000);

                        }
                    })
                } else {
                    console.log(count + " / " + ppn + ": IN CACHE");
                    if (hasMorePPNs()) {
                        withNextPPN(processPPN);
                    } else {
                        console.log("No more PPNS.")
                    }

                }

            });
        }

        if (hasMorePPNs()) {
            withNextPPN(processPPN);

        }

        /*
         // Insert some users
         collection.insert([title1], function (err, result) {
         if (err) {
         console.log(err);
         } else {
         console.log('Inserted %d documents into the "catalog" collection. The documents inserted with "_id" are:', result.length, result);
         }
         //Close connection
         db.close();
         });
         */
    }
});