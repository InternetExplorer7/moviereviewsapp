/*jshint node:true*/
//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var fs = require('fs');
var request = require('request');
var bodyParser = require('body-parser')
        // var recognize = require('./recognize');
        // var wit = require('./wit');
        // cfenv provides access to your Cloud Foundry environment
        // for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
// create a new express server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var getavg = require('./getavg.js');
var dl = require('./dlfile.js');
var wit = require('./wit.js');
var movie = require('./movieresponse.js');




// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
        extended: false
}));
// parse application/json
app.use(bodyParser.json())


io.on('connection', function(socket) {
        console.log("Connected");
        socket.on('active', function(text, uuid, curmovie) { // Search
                request({
                        url: "http://api.themoviedb.org/3/search/movie?api_key=key&query=" + text,
                        json: true
                }, function(error, response, body) {
                        if (body.total_results === 0 && curmovie) {
                        	    var templist = [];
                                console.log("Starting smart search"); // This is where smart search will go.
                                wit(text, function(err, res){
                                	if(err){
                                		console.log(err);
                                	}
                                	   Object.keys(res.outcomes[0].entities).forEach(function(item){
        									templist.push(item);
        								});
                                	   movie(curmovie, function (body){
                                	   	console.log("Hit movie function, got body back " + JSON.stringify(body, null, " "));
                                	   	console.log("MOVIE -> " + curmovie)
                                	   	console.log("LIST " + templist);
                                	   	getavg(templist, body, function (finalaverage){
                                	   		console.log("GOT FINAL AVERAGE " + finalaverage);
                                	   		io.emit('start', finalaverage, body.Title, templist, uuid); // Avg num, image and names
                                	   	});
                                	   });
                                });
                        } else if (body.results) {
                                body.results.forEach(function(title) {
                                        io.emit('movies', title.title, title.release_date, uuid);
                                        console.log(title.title);
                                        console.log(title.release_date);
                                });
                        }
                });
        });

        socket.on('getinfo', function(title, scores, uuid) { // Get movie information
                        // Download image to server
                    movie(title, function (body){
                        if (body.Poster) {
                                dl(body.Poster.substring(body.Poster.indexOf('/images')), 'public/images/' + body.Title + '.jpg', function(resp) {
                                        if (scores.length === 0) { // Nothing selected
                                                console.log("Nothing was checked, sending poster");
                                                io.emit('start', null, body.Title, null, uuid); // Just send poster
                                        } else { // User has selected some preferences
                                                getavg(scores, body, function(finalaverage) {
                                                        io.emit('start', finalaverage, body.Title, scores, uuid); // Avg num, image and names
                                                });
                                        } // User selected pref END
                                }); // dl callback
                        } // Body poster if
                    }); // Get JSON movie resp
        }); // Socket getinfo
}); // root connection
// start server on the specified port and binding host
server.listen(appEnv.port, appEnv.bind, function() {

        // print a message when the server starts listening
        console.log("server starting on " + appEnv.url);
});