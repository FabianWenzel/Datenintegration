var request = require('request');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var ppnsList = require("./ppnlist.json");

var ppnIndex = 0;
var hasMorePPNs = function () {
    return ppnIndex < ppnsList.length;
}
var withNextPPN = function (callback) {
    var thisPPN = ppnsList[ppnIndex++];
    setTimeout(function () {
        callback(thisPPN)
    }, 1);
}

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'datenintegration'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});


//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/dataintegration';
var zaehler = 0;
var zaehlerinsert = 0;

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

                if (!res) {
                    console.log("Data for PPN not yet available: " + ppn)

                    if (hasMorePPNs()) {
                        withNextPPN(processPPN);
                    } else {
                        console.log("No more PPNS.")
                    }
                } else {
                    var xml = res.xml;
                    var doc = new dom().parseFromString(xml);
                    var title = xpath.select('//datafield[@tag="245"]/subfield[@code="a"]/text()', doc).toString();
                    // var rvk = xpath.select('//datafield[@tag="936"]/subfield[@code="a"]/text()', doc);
                    //   console.log(rvk);
                    //   var subjects = xpath.select('//datafield[@tag="689"]/subfield[@code="a"]/text()', doc).toString();
                    var verlag = xpath.select('//datafield[@tag="260"]/subfield[@code="b"]/text()', doc).toString().replace(/,$/, "");
                    var ort = xpath.select('//datafield[@tag="260"]/subfield[@code="a"]/text()', doc).toString();
                    var jahr = xpath.select('//datafield[@tag="260"]/subfield[@code="c"]/text()', doc).toString();
                    var creator = xpath.select('//datafield[@tag="100"]/subfield[@code="a"]/text()', doc).toString();
                    var isbnr = xpath.select('//datafield[@tag="020"]/subfield[@code="9"]/text()', doc).toString();
                    var auflage = xpath.select('//datafield[@tag="250"]/subfield[@code="a"]/text()', doc).toString();
                    // RVK: //datafield[@tag="936"]/subfield[@code="a"] quelle: rvk annehmen
                    // Schlagwort: //datafield[@tag="689"]/subfield[@code="a"], code="2" muss GND sein
                    console.log("Count "+ zaehler + " Current PPN: " + ppn + " / Title: " + title);
                    console.log("Ort " +ort);
                    zaehler = zaehler +1;
                    // console.log("RVK: " + rvk + " / Subjects: " + subjects);

                    var obj = {
                        titel: title,
                        ppn: ppn,
                        verlag: ort + verlag,
                        isbn: isbnr,
                        autor: creator,
                        auflage: auflage,
                        jahr: parseInt(jahr)
                    };



                    connection.query('INSERT INTO titel SET ?', obj, function(err, result) {
                        if (err) throw err;
                        console.log('zaehlerinsert ' + zaehlerinsert +' Inserted: ' + ppn);
                        zaehlerinsert = zaehlerinsert +1;
                    });



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
    }
});/**
 * Created by fabian on 30.04.2016.
 */
