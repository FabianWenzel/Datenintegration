/**
 * Created by fabian on 24.04.2016.
 */
var fs = require('fs');

fs.writeFileSync("indexByPPN.json", "");
fs.writeFileSync("ppnlist.json", "");


function indexBy(arr, prop) {
    return arr.reduce(function (prev, item) {
        if (!(item[prop]in prev))
            prev[item[prop]] = [];
        prev[item[prop]].push(item);
        return prev;
    }, {});
}

function writeToFile(filename, data) {
    var err = fs.appendFileSync(filename, data + "\n");
    if (err) {
        console.log("Error writing to file " + filename + "!");
        throw err;
    }
}


var exemplars = require("./exemplars.json");
var ppns = indexBy(exemplars, "ppn");
var ppnsList = [];
for (ppn in ppns) {
    ppnsList.push(ppn);
}

writeToFile("indexByPPN.json", JSON.stringify(ppns));
writeToFile("ppnlist.json", JSON.stringify(ppnsList));