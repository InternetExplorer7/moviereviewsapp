module.exports = function(scores, body, callback) {
        var getavg = [];
        var finalnum = 0;
        scores.forEach(function(review) {
                switch (review) {
                        case 'RottenTomatoes':
                                getavg.push(body.tomatoRating);
                                break;
                        case 'IMDb':
                                getavg.push(body.imdbRating);
                                break;
                        case 'Metacritic':
                                getavg.push(body.Metascore / 10);
                                break;
                        default:
                                console.log("No cases matched!");
                }
        });
        getavg.forEach(function(num) {
                finalnum += parseInt(num);
                console.log("Number added: " + parseInt(num));
                console.log("Number added (PURE): " + typeof num);
        });
        finalnum /= getavg.length;
        finalnum *= 10;
        finalnum = Math.floor(finalnum);
        callback(finalnum);
}