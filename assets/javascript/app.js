$(document).ready(function() {

// Hide the video player and its background
$("#video-player").hide();
$("#video-background").hide();

// VARIABLES
// ==================================================

// List of favorite movies
var favoriteMovies = [];


// FUNCTIONS FOR LATER USE
// ==================================================

// Create the list of favorite movies on the web page
var showFavoriteMovies = function() {

        $("#wishlist-container").html("");

        for (i = 0; i < favoriteMovies.length; i++) {
                  
            $("#wishlist-container").append("<div class='wishlist'><img class='movie-wish' src='" + favoriteMovies[i] + "'><button class='checkbox' id='" + i + "'>✓</button>");
    
        }

}


// USER-TRIGGERED BEHAVIORS
// ==================================================

// Capture user input and show search results
$("#search-movie").on("click", function(event) {

    event.preventDefault();

    var movie = $("#movie-input").val().trim();

    // Use the OMDb API to get results
    var OMDBqueryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";

    $.ajax({
        url: OMDBqueryURL,
        method: "GET"
      }).then(function(response) {
  
        console.log(response);
        
        $("#results-div").empty();

        var maxResults;

        if (response.Search.length > 5) {
            maxResults = 5;
        }

        else {
            maxResults = response.Search.length;
        }

        for (i = 0; i < maxResults; i++) {

            // Populate the web page with results
            $("#results-div").append("<div class='results animated fadeIn'><img class='result-img' src='" + response.Search[i].Poster + "'><div class='movie-info'><h2>" + response.Search[i].Title + "</h2><h3>Year: " + response.Search[i].Year + "</h3><a href='#' class='watch-trailer' id='" + response.Search[i].imdbID + "' data-title='" + response.Search[i].Title + "'>Watch Trailer</a><a href='https://www.imdb.com/title/" + response.Search[i].imdbID + "' target='_blank'>Open on IMDb</a><button type='button' class='add-button' data-poster='" + response.Search[i].Poster + "'>Add to Wish List</button></div></div>");

        }

      });

  });

// Define behavior when a "trailer" link is clicked
$(document).on("click", ".watch-trailer", function(){

    // Capture the IMDb ID
    var clickedID = $(this).attr("id");
    var clickedMovieTitle = $(this).attr("data-title");

    // Use the MovieDB API to add trailers to each result
    var MDBqueryURL = "https://api.themoviedb.org/3/movie/" + clickedID + "/videos?api_key=ee00799d9647027160a387c172fcee51";

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
            $("#video-player").append("<button id='close-button' class='close-trailer'>✘</button>");
        
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

    // Push new movie ID into the array
    favoriteMovies.unshift($(this).attr("data-poster"));

    // Save the updated array into local storage
    localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));

    // Show the updated array on the web page
    showFavoriteMovies();

});

// Define behavior when a checkbox button is clicked
$(document).on("click", ".checkbox", function() {

    // Delete the item for which the checkbox was clicked
    favoriteMovies.splice($(this).attr("id"), 1);

    //Show updated movie list
    showFavoriteMovies();

    // Save the updated array into local storage
    localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));

  });


// BEHAVIOR ON PAGE LOAD
// ==================================================

// Populate the array from local storage
favoriteMovies = JSON.parse(localStorage.getItem("favorite-movies"));

// Keep the array empty if there are no movie IDs saved in local storage
if (!Array.isArray(favoriteMovies)) {
    favoriteMovies = [];
  }

// Populate the list of favorite movies on the page
showFavoriteMovies();

});