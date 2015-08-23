module.exports = function(path, file, callback) {
        var fs = require('fs');
        var http = require('http');

        var f = fs.createWriteStream(file);
        var options = {
                host: 'ia.media-imdb.com',
                port: 80,
                path: path
        }

        http.get(options, function(res) {
                res.on('data', function(chunk) {
                        f.write(chunk);
                });
                res.on('end', function() {
                        f.end();
                        callback(true);
                });
        });
}