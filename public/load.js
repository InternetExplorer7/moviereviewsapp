$(document).ready(function() {
        var socket = io();
        var pressed = false;
        var uuid = Math.floor(Math.random() * 9999999);
        var gtitle;
        var pref = [];
        var curmovie;
        var images = ["Resources/moviephotos_1/2001.jpg", "Resources/moviephotos_1/alien.jpg", "Resources/moviephotos_1/2001.jpg", "Resources/moviephotos_1/amadeus.jpg", "Resources/moviephotos_1/badlands.jpg", "Resources/moviephotos_1/blood.jpg", "Resources/moviephotos_1/blood.jpg", "Resources/moviephotos_1/budapest.jpg", "Resources/moviephotos_1/clockwork.jpg", "Resources/moviephotos_1/daysofheaven.jpg", "Resources/moviephotos_1/edge.jpg", "Resources/moviephotos_1/eternal.jpg", "Resources/moviephotos_1/godfather.jpg", "Resources/moviephotos_1/goodfellas.jpg", "Resources/moviephotos_1/her.jpg", "Resources/moviephotos_1/lebowski.jpg", "Resources/moviephotos_1/master.jpg", "Resources/moviephotos_1/moonrise.jpg", "Resources/moviephotos_1/ogf.jpg", "Resources/moviephotos_1/privateryan.jpg", "Resources/moviephotos_1/shawshank.jpg", "Resources/moviephotos_1/shining.jpg", "Resources/moviephotos_1/skyfall.jpg", "Resources/moviephotos_1/solaris.jpg", "Resources/moviephotos_1/starwars.jpg", "Resources/moviephotos_1/taxidriver.jpg", "Resources/moviephotos_1/whiplash.jpg", "Resources/moviephotos_1/wild things.jpg"];
        $("#overall").css("background", "url(" + images[Math.floor(Math.random() * 28)] + ") no-repeat center center fixed");
        $("#overall").css('background-size', 'cover');
        $("footer form").hide();
        $("#newimg").hide();

        $("footer h1").click(function() {
                $("footer form").slideToggle(500);
        });
        $("#main").click(function() { // Main input is pressed
                pressed = true;
                console.log("Pressed");
        });
        $("#main").blur(function() {
                pressed = false;
                console.log("This item has lost its focus");
        });
        $(document).keyup(function(e) {
                if (e.which === 13) {
                        return;
                }
                if (pressed === true) {
                        $("#movielist").html('');
                        gtitle = $("#main").val().toLowerCase();
                        console.log(gtitle);
                        socket.emit('active', $("#main").val(), uuid, curmovie);
                }
        });

        $("#search").submit(function() {
                console.log("Hit submit");
                $("#movielist").html('');
                gtitle = $("#main").val().toLowerCase();
                console.log(gtitle);
                socket.emit('active', $("#main").val(), uuid, curmovie);
                return false;
        });

        socket.on('movies', function (title, date, id) {
                if (uuid === id && $("#movielist li").length < 5) {
                        if (date === null) {
                                if (gtitle === title.toLowerCase()) {
                                        $("#movielist").append("<li data-title=\"" + title + "\"> <a href='javascript:void(0)'> <strong>" + title + "</strong></a> </li>");
                                } else {
                                        $("#movielist").append("<li data-title=\"" + title + "\"> <a href='javascript:void(0)'> " + title + "</a> </li>");
                                }
                        } else {
                                date = date.substring(0, date.indexOf('-'));
                                if (gtitle === title.toLowerCase()) {
                                        $("#movielist").append("<li data-title=\"" + title + "\"> <a href='javascript:void(0)'> <strong>" + title + "</strong> (" + date + ")" + "</a> </li>");
                                } else {
                                        $("#movielist").append("<li data-title=\"" + title + "\"> <a href='javascript:void(0)'> " + title + " (" + date + ")" + "</a> </li>");
                                }
                        }
                }
        });

        socket.on('start', function(finalscore, poster, sources, userid) {
                if (userid === uuid) {
                        console.log("hit image");
                        $("#newimg").show();
                        $("#newimg").attr('src', 'images/' + poster + '.jpg'); // Set image
                        $("#score").html(finalscore);
                        if (!sources) {
                                $("#scoredesc").html("You didn't choose any sources )':");
                                $("footer form").slideToggle(500);
                                $("#score").html("");
                        } else if (finalscore === null) {
                                $("#scoredesc").html("We couldn't find scores from the sources you selected");
                        } else {
                                switch (sources.length) {
                                        case 1:
                                                $("#scoredesc").html(poster + " has gotten a score of " + finalscore + " from " + sources[0]);
                                                break;
                                        case 2:
                                                $("#scoredesc").html(poster + " has an average score of " + finalscore + " based on ratings gathered from " + sources[0] + " and " + sources[1]);
                                                break;
                                        case 3:
                                                $("#scoredesc").html(poster + " has an average score of " + finalscore + " based on ratings gathered from " + sources[0] + ", " + sources[1] + " and " + sources[2]);
                                                break;
                                        default:
                                                $("#scoredesc").html("Looks like you might have run into an error /:");
                                }
                        }

                }
        });

        $("#movielist").on('click', 'li', function() { // Get movie name, start creating movie page.
                curmovie = $(this).data('title');
                socket.emit('getinfo', $(this).data('title'), pref, uuid); // Send which movie they want to view and user preferences [array]
        });

        $("[type=checkbox]").change(function() { // A checkbox has been clicked/unclicked
                pref.length = 0;
                $('input[type=submit]').click();
        });

        $("footer form").submit(function(e) { // Parent triggered
                e.preventDefault();
                var checkboxes = $(this).serializeArray();
                if (checkboxes.length !== 0) {
                        checkboxes.forEach(function(name) {
                                pref.push(name.name); // Update users' preference to array
                                console.log(pref);
                        });
                        if (curmovie) { // If a current movie is selected
                                socket.emit('getinfo', curmovie, pref, uuid);
                        }

                } else {
                        console.log("No checkboxes checked");
                        $("#scoredesc").html("You didn't choose any sources )':");
                        $("#score").html("");
                }
                return false;
        });
});