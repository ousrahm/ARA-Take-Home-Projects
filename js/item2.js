$(document).ready(function () {

    // When "Ready to Play!" button is pressed, open setup page.
    $(document).on("click", "#ready-to-play", function() {
        $("#main-game-container").empty().load("pages/game/setup.html");
    })

});