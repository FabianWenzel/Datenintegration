/**
 * Created by fabian wenzel on 10.04.2016.
 */
// https://www.npmjs.com/package/fast-csv
// Reading CSV-File with npm  fast-csv

// require (load modules or librarys, in this case load FileSystem and the fast-csv package)
var fs = require('fs');

var csv = require('fast-csv');

//Returns a new ReadStream object
var stream = fs.createReadStream("Liste_PPN-ExNr_HSHN-libre.csv");


// .fromStream This accepted a readable stream to parse data from.
// Setting the headers option will cause change each row to an object rather than an array.
csv
//.fromStream(stream, {headers : true})
    .fromStream(stream, {headers : ["PPN", "ExNr", "Signatur", "Barcode", "Sigel"]})
    // same as headers : true

    .on("data", function(data){
        console.log(data);
    })
    .on("end", function(){
        console.log("done");
    });