$(document).ready(function() {

// Hide some divs on page load
$("#video-player").hide();
$("#video-background").hide();
$("#wishlist-container").hide();


// GLOBAL VARIABLES
// ==================================================

// Hold the keys for APIs and database
var keys = {
    OMDb: "trilogy",
    TMDb: "ee00799d9647027160a387c172fcee51"
};

// Define global variable for the user
var currentUser;

// Define list of page backgrounds
var backgrounds = ["bg1.jpg", "bg2.jpg", "bg3.jpg", "bg4.jpg"];
var randomBackgroundNumber = Math.floor(Math.random() * 4);


// USER AUTHENTICATION AND DATABASE
// ==================================================

// Firebase configuration    
var config = {
    apiKey: "AIzaSyCN1PSw8wmS16qrwUA66gSDcBl0cQuv7JE",
    authDomain: "movie-wish-list-v2.firebaseapp.com",
    databaseURL: "https://movie-wish-list-v2.firebaseio.com",
    projectId: "movie-wish-list-v2",
    storageBucket: "movie-wish-list-v2.appspot.com",
    messagingSenderId: "378231234702"
};

// Firebase initialization
firebase.initializeApp(config);

// Define global variable for the database
var database = firebase.database();

// Trigger anonymous authentication
firebase.auth().signInAnonymously().catch(function(error) {
console.log("Authentication error code: " + error.code + ". Message: " + error.message);
});

// Retrieve the user ID assigned by Firebase
firebase.auth().onAuthStateChanged(function(user) {

    currentUser = user.uid;

    // Get real-time updates from the database for the current user, and populate the Wish List accordingly
    database.ref(currentUser).on("child_added", function(snapshot) {
        var sv = snapshot.val();
        console.log(sv);           
        $("#wishlist-container").prepend("<div class='wishlist animated fadeIn'><a href='#'><img class='movie-wish' src='" + sv.poster + "' alt='" + sv.title + "' data-IMDb='" + sv.IMDb + "'></a><button class='checkbox' data-db-id='" + snapshot.key + "'><i class='fas fa-check'></i></button>"); 
    });

});


// USER-TRIGGERED BEHAVIORS
// ==================================================

// Capture user input and show search results
$("#search-movie").on("click", function(event) {

    event.preventDefault();

    var movie = $("#movie-input").val().trim();

    // Validate input
    if (movie == "") {
        swal({
            title: "No input",
            text: "Please write something in the search box",
            icon: "error",
            });
    }

    else {

        // Use the OMDb API to get results
        var omdbLambdaUrl = "./api/omdb";

        async function omdbFetch(omdbLambdaUrl, movie) {

            const res = await fetch(omdbLambdaUrl, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"movie": movie})
            });

            const response = await res.json();
        
            console.log(response);
            
            $("#results-div").empty();

            var maxResults;

            if (response.Search.length > 10) {
                maxResults = 10;
            }

            else {
                maxResults = response.Search.length;
            }

            for (i = 0; i < maxResults; i++) {

                if (response.Search[i].Poster !== "N/A") {

                // Populate the web page with results
                $("#results-div").append("<div class='results animated fadeIn'><img class='result-img' src='" + response.Search[i].Poster + "'><div class='movie-info'><h2>" + response.Search[i].Title + "</h2><h3>(" + response.Search[i].Year + ")</h3><a class='watch-trailer' id='" + response.Search[i].imdbID + "' data-title='" + response.Search[i].Title + "'>Watch Trailer</a><a href='https://www.imdb.com/title/" + response.Search[i].imdbID + "' target='_blank'>Open on IMDb</a><button type='button' class='add-button' data-title='" + response.Search[i].Title + "' data-poster='" + response.Search[i].Poster + "' data-IMDb='" + response.Search[i].imdbID + "'>Add to Wish List</button></div></div>");

                }

            }

        }

        omdbFetch(omdbLambdaUrl, movie);

    }

  });

// Define behavior when a "trailer" link is clicked
$(document).on("click", ".watch-trailer", function(){

    // Capture the IMDb ID
    var clickedID = $(this).attr("id");
    var clickedMovieTitle = $(this).attr("data-title");

    // Use the MovieDB API to add trailers to each result
    var MDBqueryURL = "https://api.themoviedb.org/3/movie/" + clickedID + "/videos?api_key=" + keys.TMDb;

    // Return error message if the movie has no trailer available
    function trailerError() {
        swal({
            title: "Sorry!",
            text: "There is no trailer available for \"" + clickedMovieTitle + "\"",
            icon: "error",
            });
    }

    $.ajax({
        url: MDBqueryURL,
        method: "GET"
    })

    .done(function(trailerResponse) {

        if (trailerResponse.results.length > 0) {
            $("#video-background").show();
            $("#video-player").show();
            $("#video-player").html("<iframe width='853' height='480' src='https://www.youtube.com/embed/" + trailerResponse.results[0].key + "' frameborder='0' allowfullscreen></iframe>'");
            $("#video-player").append("<button id='close-button' class='close-trailer'><i class='fas fa-times'></i></button>");
        }

        else {
            trailerError();
        }
        
    })

    .fail(function() {
        trailerError();
    })

    .always(function(trailerResponse) {
        console.log(trailerResponse);
    });

});

// Close video on user input
$(document).on("click", ".close-trailer", function(){

    $("#video-background").hide();
    $("#video-player").hide();
    $("#video-player").html("");

});

// Define behavior when an "add" button is clicked
$(document).on("click", ".add-button", function(){

    // Push movie details to the database
    database.ref(currentUser).push({
        title: $(this).attr("data-title"),
        poster: $(this).attr("data-poster"),
        IMDb: $(this).attr("data-IMDb")
  });

  $("#wishlist-container").show();
  $("#wishlist-toggle").hide();

});

// Define behavior when a checkbox button is clicked
$(document).on("click", ".checkbox", function() {

    // Delete the item for which the checkbox was clicked
    var id = $(this).attr("data-db-id");
    console.log("Deleting: ", id);
    database.ref(currentUser + "/" + id).remove();

    // Get the updated movie list from the database and show it on the page
    database.ref(currentUser).once('value', function(snapshot) {
        $("#wishlist-container").empty();
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var csv = childSnapshot.val();
         $("#wishlist-container").prepend("<div class='wishlist animated fadeIn'><a href='#'><img class='movie-wish' src='" + csv.poster + "' alt='" + csv.title + "' data-IMDb='" + csv.IMDb + "'></a><button class='checkbox' data-db-id='" + childKey + "'><i class='fas fa-check'></i></button>");
        });
    });

});

// Define behavior when a wishlist movie poster is clicked
$(document).on("click", ".movie-wish", function() {

    var clickedMovieId = $(this).attr("data-IMDb");
    console.log("Clicked Movie ID: " + clickedMovieId);

    // Add on-click animation
    $(this).addClass("animated pulse");

    // Use the OMDb API to get results
    var OMDBqueryURL = "https://www.omdbapi.com/?i=" + clickedMovieId + "&apikey=" + keys.OMDb;

    $.ajax({
        url: OMDBqueryURL,
        method: "GET"
        }).then(function(response) {

        // Populate the web page with details on the clicked movie
        $("#results-div").html("<div class='results animated bounceInRight'><img class='result-img' src='" + response.Poster + "'><div class='movie-info'><h2>" + response.Title + "</h2><h3>(" + response.Year + ")</h3><a href='#' class='watch-trailer' id='" + response.imdbID + "' data-title='" + response.Title + "'>Watch Trailer</a><a href='https://www.imdb.com/title/" + response.imdbID + "' target='_blank'>Open on IMDb</a></div></div>");

    });

});

// Some final touches for the main page

$(document).on("click", "#home", function() {
    $("#results-div").empty();
    $("#wishlist-container").hide();
    $("#wishlist-toggle").show();
});

$(document).on("click", "#wishlist-toggle", function() {
    $("#wishlist-container").show();
    $("#wishlist-toggle").hide();
});

$("body").css("background-image", "url('./assets/images/" + backgrounds[randomBackgroundNumber] + "')");

setTimeout(function() {
    $("#footer-note").hide();
}, 5000);

});