module.exports = function (text, callback){
var wit = require('node-wit');
var fs = require('fs');
var ACCESS_TOKEN = "ACCESS_TOKEN";

console.log("Sending text & audio to Wit.AI");

wit.captureTextIntent(ACCESS_TOKEN, text, function (err, res) {
    if (err) console.log("Error: ", err);
    callback(err, res);
});

}