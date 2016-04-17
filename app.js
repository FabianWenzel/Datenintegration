var http = require('http');
var request = require("request");
//var xml2json = require('xml2json');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/swb');

var Item = mongoose.model('Item', {
    ppn: Number,
    xml: String
});

var item = new Item({
    ppn: 469971,
    xml: '<xml></xml>'
});

item.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('saved');
    }
});


// var url = 'http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22435169297%22&version=1.1&operation=searchRetrieve&stylesheet=http%3A%2F%2Fswb.bsz-bw.de%2Fsru%2F%3Fxsl%3DsearchRetrieveResponse&recordSchema=marc21&maximumRecords=1&startRecord=1&recordPacking=xml&sortKeys=none&x-info-5-mg-requestGroupings=none';
//
// request(url, function(error, response, data) {
//     console.log(data);
//     var json = xml2json.toJson(data);
//     console.log(json);
// });