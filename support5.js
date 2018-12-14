const https = require('https');
var fs = require('fs');
var parsedJSON = require('../build.json');

let plugins = parsedJSON["plugins"];
let len = Object.keys(parsedJSON["plugins"]).length;
let keys = Object.keys(plugins);
let c = 0;
let json = {plugins:[]};

console.log("\n");
console.log("Finded " + len + " plugins");
console.log("\n");

keys.forEach(function (s) {
    c++;
    setTimeout(function (){
        https.get('https://api.wordpress.org/plugins/info/1.0/' + s + '.json', function (res) {
            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                var fbResponse = JSON.parse(body);
                if(fbResponse.tested === undefined){
                    console.log(s + " !!!PREMIUM PLUGIN!!!");
                } else{
                    console.log(s);
                }
                
                json.plugins.push({plugin:s, support: fbResponse.tested});
                if(json.plugins.length === c){
                    save();
                }
                
            });
        }).on('error', function (e) {
            console.log("Got an error: ", e);
        });
        
    },500 * c);
    
});

function save(){
    console.log("\n");
    console.log("Done!");
    console.log("\n");
    
    fs.writeFile('all_plugins.json', JSON.stringify(json), 'utf8', function (err) {
        if (err) throw err;
    });
    
    let support5 = json.plugins.filter((plugin => plugin.support >= '5.0.0'));
    fs.writeFile('support5.json', JSON.stringify(support5), 'utf8', function (err) {
        if (err) throw err;
    });

    let not_supported = json.plugins.filter((plugin => plugin.support < '5.0.0'));
    fs.writeFile('not_supported.json', JSON.stringify(not_supported), 'utf8', function (err) {
        if (err) throw err;
    });
    
}