var request = require('request');
module.exports = function(title, callback){
	    request({
	url: "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&r=json&tomatoes=true",
	json: true
	}, function(error, response, body) {
		callback(body);
	});
}