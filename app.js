var http = require('http');
var request = require("request");
var fs = require('fs');
//var xml2json = require('xml2json');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/swb');

var Item = mongoose.model('Item', {
    ppn: String,
    xml: String
});

var swbFetcher = function(ppn, callback) {
    var url = 'http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%' + ppn +'%22&version=1.1&operation=searchRetrieve&stylesheet=http%3A%2F%2Fswb.bsz-bw.de%2Fsru%2F%3Fxsl%3DsearchRetrieveResponse&recordSchema=marc21&maximumRecords=1&startRecord=1&recordPacking=xml&sortKeys=none&x-info-5-mg-requestGroupings=none';

    request(url, function(error, response, data) {
        var item = new Item({
            ppn: ppn,
            xml: data
        });

        if (typeof callback === "function") {
            callback(item);
        }
    });
};

var saveItem = function(item) {
    item.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('saved');
        }
    });
};

var readJsonFile = function(path, callback) {
    fs.readFile(path, 'utf8', function(err,data) {
        if (err) throw err;

        var obj = JSON.parse(data);

        if (typeof callback === "function") {
            callback(obj);
        }
    });
};


readJsonFile('result.txt', function(data) {
    data.forEach(function(item) {
        swbFetcher(item.ppn, function(item) {
            saveItem(item);
        });
    })
});