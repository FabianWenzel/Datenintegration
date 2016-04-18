// https://www.npmjs.com/package/fast-csv
// Reading CSV-File with npm  fast-csv
//Not Working so far

// require (load modules or librarys, in this case load FileSystem and the fast-csv package)
var fs = require('fs');

var csv = require('fast-csv');

var async = require('async');



// HILFSFUNKTIONEN
function writeToFile(filename, data) {
    var err = fs.appendFileSync(filename, data)

    if(err) {
        console.log("Error writing to file " + filename + "!");
        throw err;
    }
}

function resetFiles() {
    fs.writeFileSync("output.csv", "");
    fs.writeFileSync("error.log", "");
}

function output(data) {
    writeToFile("output.csv", data);
}

function error(data) {
    writeToFile("error.log", data);
}


resetFiles();

//Returns a new ReadStream object
var result = [];

var stream = fs.createReadStream("Liste_PPN-ExNr_HSHN-libre.csv");


// .fromStream This accepted a readable stream to parse data from.
// Setting the headers option will cause change each row to an object rather than an array.

var csvStream = csv({
{headers : true, 
    ignoreEmpty: true,
    trim: true
})
//.fromStream(stream, {headers : ["PPN", "ExNr", "Signatur", "Barcode", "Sigel"]})
// same as headers : true

.transform(function(data) {
    // Transform the Data in the Stream, length of PPN should be 9 Copyed from Julius Renner.
    transformedData = {
        ppn: '0'.repeat(9 - data.PPN.length) + data.PPN,
        exemplarDatensatznr: data['Exemplar-Datensatznr'],
        signatur: data.Signatur,
        barcode: data.Barcode,
        sigel: data.Sigel,
    };
    return transformedData;
})

    .on("data", function(data){
        result.push(data);
    })
    .on("data-invalid", function(row) {
        // If data invalid, write to errorLog
        //errorLogStream.write('Invalid data: ' + data + '\n');
        error("Komische Zeile: " + row.PPN);
    })

    .on("end", function(){
        console.log("done");
    });