//After failing so often...

// Pfad zur Datei
var inputFile = "Liste_PPN-ExNr_HSHN-libre.csv";
var resultFile = "result.txt";
var errorFile = "error.txt";

// Bibliotheken
var fs = require('fs');
var HashMap = require('hashmap');
var md5 = require("crypto-js/md5");

var datarow = new Array();
var statsSigel = new HashMap();
var statsSignatur = new HashMap();
var statsPpn = new HashMap();
var statsBarcode = new HashMap();
var statsExemplar = new HashMap();
var statsExemplarSum = new HashMap();
var hashCompare = new HashMap();

var exemplar1 = {
    ppn: "123",
    number: 123,
    signatur: "abc",
    barcode: "xyz",
    sigel: "aaa"
};

var exemplar2 = {
    ppn: "123",
    number: 123,
    signatur: "abc",
    barcode: "xyz",
    sigel: "aaa"
};

console.log(exemplar1 +"=="+ exemplar2);
console.log("Obj: " + (exemplar1 == exemplar2));

var json1 = JSON.stringify(exemplar1);
var json2 = JSON.stringify(exemplar2);

console.log(json1.toString() +"=="+ json2.toString());
console.log("JSON: " + (json1 == json2));

var md5a = md5(json1);
var md5b = md5(json2);
console.log(md5a +"=="+ md5b);
console.log("MD5: " + (md5a.toString() == md5b.toString()));

function setStatsFor(map, value) {
    if (map.has(value)) {
        map.set(value, (map.get(value) + 1))
    } else {
        map.set(value, 1);
    }
}

fs.readFile(inputFile, 'utf8', function (err, data) {
    if (err) throw err;
    var lines = data.split(/\r?\n/);
    var i = 0;
    var quotes = false;
    lines.forEach(function (line) {
        // Header übegehen
        if (i == 0 || line.length == 0) {
            i++;
            return;
        }

        lineArr = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        if (lineArr.length != 5) {
            writeError("[Zeile " + i + "] Error: Zeile hat weniger als 5 Spalten.\r\n");
        } else {
            var ppn = lineArr[0];
            var examplenum = lineArr[1];
            var signature = lineArr[2];
            var barcode = lineArr[3];
            var sigel = lineArr[4];


            ppn = "0".repeat(9 - ppn.length) + ppn;

            var exemplar = {
                ppn: ppn,
                number: examplenum,
                signatur: signature,
                barcode: barcode,
                sigel: sigel
            };

            setStatisicsFor(exemplar);

            datarow.push(exemplar);
        }

        i++;
    });

    writeResult(JSON.stringify(datarow, null, 2));

    statsExemplar.forEach(function(value, key) {
        setStatsFor(statsExemplarSum, value);
    });

    statisticOutput();



});

function statisticOutput() {

    console.log("Anzahl Datensätze: " + datarow.length);
    console.log("---");
    if (datarow.length == statsBarcode.count()) {
        console.log("Barcodes sind eindeutig.");
    } else {
        console.log("ACHTUNG: Barcodes sind NICHT eindeutig.");
        var notUniqueBarcode = 0;
        statsBarcode.forEach(function(value, key) {
            if (value > 1) {
                console.log("Barcode '" + key + "' kommt " + value + " mal vor.");
                writeError("Warning: Barcode '" + key + "' kommt " + value + " mal vor.\r\n");
                notUniqueBarcode += 1;
            }
        });
        console.log("Nicht eindeutige Barcodes Total: " + notUniqueBarcode + " von " + datarow.length);
    }
    console.log("---");
    if (datarow.length == statsExemplar.count()) {
        console.log("Exemplar Nummern sind eindeutig.");
    } else {
        console.log("ACHTUNG: Exemplar Nummern sind NICHT eindeutig.");
        var notUniqueExemplare = 0;
        statsExemplar.forEach(function(value, key) {
            if (value > 1) {
                console.log("Exemplar Nummer '" + key + "' kommt " + value + " mal vor.");
                writeError("Warning: Exemplar Nummer '" + key + "' kommt " + value + " mal vor.\r\n");
                notUniqueExemplare += 1;
            }
        });
        console.log("Nicht eindeutige Exemplare Total: " + notUniqueExemplare + " von " + datarow.length);
    }
    console.log("---");
    var sigelTotal =0;
    statsSigel.forEach(function(value, key){
        console.log("Anzahl Sigel '"+key+"': " + value);
        sigelTotal += value;
    });
    console.log("Sigel Total: " + sigelTotal + " von " + datarow.length + " -> " + (sigelTotal==datarow.length));
    console.log("---");
    console.log("unterschiedliche PPN: " + statsPpn.count());
    var ppnTotal =0;
    statsPpn.forEach(function(value, key){
        ppnTotal += value;
    });
    console.log("PPN Total: " + ppnTotal + " von " + datarow.length + " -> " + (ppnTotal==datarow.length));
    console.log("---");
    console.log("unterschiedliche Signaturen: " + statsSignatur.count());
    var sigTotal =0;
    statsSignatur.forEach(function(value, key){
        sigTotal += value;
    });
    console.log("Signatur Total: " + sigTotal + " von " + datarow.length + " -> " + (sigTotal==datarow.length));
    console.log("---");
    var exemTotal = 0;
    statsExemplarSum.forEach(function(value, key){
        console.log("Anzahl der Zeilen mit '"+key+"' Exemplar(en): " + value);
        exemTotal += (key*value);
    });
    console.log("Exemplare Total: " + exemTotal + " von " + datarow.length + " -> " + (exemTotal==datarow.length));

    console.log("---");

    var hashCompareTotal = 0;
    var countIdenticalLines = 0;
    hashCompare.forEach(function(value, key){
        if (value > 1) {
            countIdenticalLines += 1;
        }
        hashCompareTotal += 1;
    });
    console.log("Hash Compare Total: " + hashCompareTotal + " von " + datarow.length + " -> " + (hashCompareTotal==datarow.length));
    if ((hashCompareTotal==datarow.length)) { console.log("Keine komplett identischen Exemplare in Daten."); } else {

        console.log(countIdenticalLines + " identische Zeilen gefunden.");
    }
}

// Statistik setzen
function setStatisicsFor(exemplar) {

    setStatsFor(statsSigel, exemplar.sigel);
    setStatsFor(statsSignatur, exemplar.signatur);
    setStatsFor(statsPpn, exemplar.ppn);
    setStatsFor(statsBarcode, exemplar.barcode);
    setStatsFor(statsExemplar, exemplar.number);
    var hash = md5(JSON.stringify(exemplar));
    setStatsFor(hashCompare, hash.toString());

}

// Funktion schreibt das Ergebnis in die Ergebnisdatei
function writeResult(result) {
    fs.writeFile(resultFile, result, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("---");
        console.log("Die Datei '" + resultFile + "' wurde gespeichert!");
    });
}

// Funktion zum Fehler erfassen
function writeError(err) {
    fs.appendFile(errorFile, err, function (err) {
        if (err) {
            return console.log(err);
        }
    });
}